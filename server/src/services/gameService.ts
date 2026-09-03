import { Types } from 'mongoose';
import { Game, IGame } from '../models/Game.js';
import { Question, IQuestion } from '../models/Question.js';
import { PlayerProgress } from '../models/PlayerProgress.js';
import { shuffleCodeLines } from '../utils/questionShuffler.js';
import { calculateQuestionScore } from '../utils/scoring.js';
import { getLanguageConfig } from '../config/languages.js';

export interface StartGameDTO {
  playerName: string;
  language: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  selectedTime: number; // in seconds
  playerId?: string; // MongoDB player _id for registered users (optional for guests)
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns a stable identifier for the player's progress record.
 * Registered players: use their MongoDB _id string (persistent & unique).
 * Guest players: use sanitized player name (best-effort deduplication).
 */
const getPlayerIdentifier = (dto: StartGameDTO): string => {
  if (dto.playerId && dto.playerId.trim()) {
    return dto.playerId.trim();
  }
  return `guest::${dto.playerName.toLowerCase().trim()}`;
};

/**
 * Picks `count` random items from an array without repeating.
 */
const pickRandom = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/**
 * Selects questions for a game session with NO-REPEAT logic:
 *
 * Algorithm:
 * 1. Load the player's already-seen question IDs for this language+difficulty.
 * 2. Query the full pool size for this language+difficulty.
 * 3. Exclude seen IDs from the candidate pool.
 * 4. If the remaining unseen pool is too small (< needed), cycle is complete:
 *    reset seen list and start fresh — this is the full-cycle restart.
 * 5. Pick questions randomly from the unseen pool.
 * 6. Save the newly-picked IDs back to PlayerProgress.
 *
 * @param playerIdentifier Stable player identity string
 * @param language Language ID (e.g., 'python')
 * @param difficulty Question difficulty
 * @param difficultyPattern Array of difficulty levels for each of the 5 question slots
 * @returns Array of 5 selected IQuestion documents
 */
const selectQuestionsWithNoRepeat = async (
  playerIdentifier: string,
  language: string,
  difficulty: 'easy' | 'moderate' | 'hard',
  difficultyPattern: ('easy' | 'moderate' | 'hard')[]
): Promise<IQuestion[]> => {
  const selectedQuestions: IQuestion[] = [];
  const pickedInThisSession = new Set<string>();

  for (const diffLevel of difficultyPattern) {
    // 1. Load or create this player's progress record for this language+difficulty combo
    let progress = await PlayerProgress.findOne({
      playerIdentifier,
      language,
      difficulty: diffLevel
    });

    const seenIds: Types.ObjectId[] = progress ? progress.seenQuestionIds : [];
    const seenIdStrings = new Set(seenIds.map((id) => id.toString()));

    // Also exclude questions picked earlier in this same game session
    const excludeIds = [
      ...seenIds,
      ...Array.from(pickedInThisSession)
        .map((id) => {
          try { return new Types.ObjectId(id); } catch { return null; }
        })
        .filter(Boolean) as Types.ObjectId[]
    ];

    // 2. Count total available questions in this pool
    const totalPool = await Question.countDocuments({
      language,
      difficulty: diffLevel,
      active: true
    });

    // 3. Count unseen questions
    const unseenCount = await Question.countDocuments({
      language,
      difficulty: diffLevel,
      active: true,
      _id: { $nin: excludeIds }
    });

    // 4. Cycle detection: if no unseen questions remain, reset this difficulty's progress
    if (unseenCount === 0 && totalPool > 0) {
      console.log(
        `[GameService] Player "${playerIdentifier}" completed a full cycle of ${diffLevel} ${language} questions (${totalPool} total). Resetting progress for fresh cycle.`
      );

      if (progress) {
        progress.seenQuestionIds = [];
        progress.cyclesCompleted += 1;
        await progress.save();
      }

      // Now pick from the full pool (excluding only other questions in this session)
      const sessionExcludes = Array.from(pickedInThisSession)
        .map((id) => { try { return new Types.ObjectId(id); } catch { return null; } })
        .filter(Boolean) as Types.ObjectId[];

      const freshCandidates = await Question.find({
        language,
        difficulty: diffLevel,
        active: true,
        _id: { $nin: sessionExcludes }
      }).lean();

      if (freshCandidates.length > 0) {
        const picked = pickRandom(freshCandidates, 1)[0];
        selectedQuestions.push(picked as unknown as IQuestion);
        pickedInThisSession.add((picked._id as Types.ObjectId).toString());
      }
    } else if (unseenCount > 0) {
      // 5. Pick from unseen pool
      // Use random skip pattern for better distribution across large pools
      const skipCount = Math.floor(Math.random() * Math.min(unseenCount, 50));

      let candidates = await Question.find({
        language,
        difficulty: diffLevel,
        active: true,
        _id: { $nin: excludeIds }
      })
        .skip(skipCount)
        .limit(20)
        .lean();

      // Fallback if skip resulted in empty set
      if (candidates.length === 0) {
        candidates = await Question.find({
          language,
          difficulty: diffLevel,
          active: true,
          _id: { $nin: excludeIds }
        })
          .limit(20)
          .lean();
      }

      if (candidates.length > 0) {
        const picked = pickRandom(candidates, 1)[0];
        selectedQuestions.push(picked as unknown as IQuestion);
        pickedInThisSession.add((picked._id as Types.ObjectId).toString());
      }
    } else {
      // Pool is completely empty for this language+difficulty (no questions seeded yet)
      // Try any question in any difficulty for this language as fallback
      const fallback = await Question.findOne({
        language,
        active: true,
        _id: { $nin: Array.from(pickedInThisSession).map((id) => { try { return new Types.ObjectId(id); } catch { return null; } }).filter(Boolean) }
      }).lean();

      if (fallback) {
        selectedQuestions.push(fallback as unknown as IQuestion);
        pickedInThisSession.add((fallback._id as Types.ObjectId).toString());
      }
    }
  }

  // 6. Persist newly seen question IDs back to PlayerProgress
  const newlySeenIds = Array.from(pickedInThisSession).map((id) => new Types.ObjectId(id));

  // Group by difficulty for saving (each difficulty slot has its own progress doc)
  // Map picked questions to their difficulty for correct progress record update
  const pickedWithDiff = selectedQuestions.map((q, idx) => ({
    questionId: (q._id as Types.ObjectId).toString(),
    difficulty: difficultyPattern[idx]
  }));

  // Update progress for each difficulty level used in this game
  const difficultiesToUpdate = [...new Set(difficultyPattern)];

  for (const diffLevel of difficultiesToUpdate) {
    const questionIdsForThisDiff = pickedWithDiff
      .filter((p) => p.difficulty === diffLevel)
      .map((p) => new Types.ObjectId(p.questionId));

    if (questionIdsForThisDiff.length === 0) continue;

    await PlayerProgress.findOneAndUpdate(
      { playerIdentifier, language, difficulty: diffLevel },
      {
        $addToSet: { seenQuestionIds: { $each: questionIdsForThisDiff } },
        $inc: { totalSeen: questionIdsForThisDiff.length }
      },
      { upsert: true, new: true }
    );
  }

  return selectedQuestions;
};

// ─── Game Session ────────────────────────────────────────────────────────────

export const startGameSession = async (dto: StartGameDTO): Promise<IGame> => {
  // 1. Sanitize & validate player name
  const cleanName = (dto.playerName || '').trim().replace(/<[^>]*>?/gm, '');
  if (cleanName.length < 2 || cleanName.length > 30) {
    throw new Error('Player name must be between 2 and 30 characters.');
  }

  // 2. Validate language
  const langConfig = getLanguageConfig(dto.language);

  // 3. Validate difficulty
  if (!['easy', 'moderate', 'hard'].includes(dto.difficulty)) {
    throw new Error('Invalid difficulty selected.');
  }

  // 4. Validate selected time according to difficulty
  const timeInSeconds = Number(dto.selectedTime);
  const validTimesMap: Record<string, number[]> = {
    easy: [60, 120, 180, 240, 300],
    moderate: [60, 120, 180, 240, 300, 360],
    hard: [60, 120, 180, 240, 300, 360, 420, 480, 540, 600]
  };

  const allowedTimes = validTimesMap[dto.difficulty] || validTimesMap.easy;
  if (!allowedTimes.includes(timeInSeconds)) {
    throw new Error(
      `Invalid time duration of ${timeInSeconds / 60} minutes for difficulty ${dto.difficulty}.`
    );
  }

  // 5. Build difficulty progression pattern for 5 questions
  // Easy:     [easy, easy, easy, moderate, moderate]
  // Moderate: [moderate, moderate, moderate, hard, hard]
  // Hard:     [hard, hard, hard, hard, hard]
  let difficultyPattern: ('easy' | 'moderate' | 'hard')[] = [];
  if (dto.difficulty === 'easy') {
    difficultyPattern = ['easy', 'easy', 'easy', 'moderate', 'moderate'];
  } else if (dto.difficulty === 'moderate') {
    difficultyPattern = ['moderate', 'moderate', 'moderate', 'hard', 'hard'];
  } else {
    difficultyPattern = ['hard', 'hard', 'hard', 'hard', 'hard'];
  }

  // 6. Select 5 questions using no-repeat logic
  const playerIdentifier = getPlayerIdentifier(dto);
  const selectedQuestions = await selectQuestionsWithNoRepeat(
    playerIdentifier,
    langConfig.id,
    dto.difficulty,
    difficultyPattern
  );

  if (selectedQuestions.length < 5) {
    throw new Error(
      `Insufficient questions found for language ${langConfig.name}. Please seed the database with questions.`
    );
  }

  // 7. Build question progress with shuffled line orders
  const questionProgress = selectedQuestions.map((q) => {
    const { lineOrder } = shuffleCodeLines(q.lines);
    return {
      questionId: q._id as any,
      lineOrder,
      attempts: 0,
      correct: false,
      timeTaken: 0,
      score: 0
    };
  });

  const now = new Date();
  const expiresAt = new Date(now.getTime() + timeInSeconds * 1000);

  const game = new Game({
    playerName: cleanName,
    language: langConfig.id,
    difficulty: dto.difficulty,
    selectedTime: timeInSeconds,
    startedAt: now,
    expiresAt,
    currentQuestionIndex: 0,
    questions: questionProgress,
    totalScore: 0,
    correctAnswers: 0,
    totalAttempts: 0,
    timeUsed: 0,
    completed: false,
    status: 'active'
  });

  await game.save();
  return game;
};

export const getGameSessionState = async (gameId: string) => {
  const game = await Game.findById(gameId).populate('questions.questionId');
  if (!game) {
    throw new Error('Game session not found.');
  }

  const now = new Date();
  const isExpired = now.getTime() >= new Date(game.expiresAt).getTime();

  if (isExpired && game.status === 'active') {
    game.status = 'expired';
    game.completed = true;
    game.completedAt = now;
    game.timeUsed = game.selectedTime;
    await game.save();
  }

  const timeRemainingSeconds = Math.max(
    0,
    Math.floor((new Date(game.expiresAt).getTime() - now.getTime()) / 1000)
  );

  // Sanitize current question data before sending to client (remove correctPosition)
  const currentQIndex = game.currentQuestionIndex;
  const currentProgress = game.questions[currentQIndex];

  let currentQuestionClient = null;
  let submittedFeedback = null;

  if (currentProgress && currentProgress.questionId) {
    const rawQuestion = currentProgress.questionId as any as IQuestion;

    // Create a map of lines by id
    const lineMap = new Map(rawQuestion.lines.map((l) => [l.id, l]));

    // Order lines based on game.questions[i].lineOrder
    const shuffledLines = currentProgress.lineOrder.map((lineId) => ({
      id: lineId,
      code: lineMap.get(lineId)?.code || ''
    }));

    currentQuestionClient = {
      title: rawQuestion.title,
      description: rawQuestion.description,
      language: rawQuestion.language,
      difficulty: rawQuestion.difficulty,
      lines: shuffledLines,
      totalLines: rawQuestion.lines.length
    };

    // If already submitted on this question, build feedback payload
    if (
      currentProgress.submittedSelection &&
      currentProgress.submittedSelection.size > 0
    ) {
      const selectionObj: Record<string, number> = Object.fromEntries(
        currentProgress.submittedSelection as any
      );
      const sortedLines = [...rawQuestion.lines].sort(
        (a, b) => a.correctPosition - b.correctPosition
      );
      const displayedShuffledLines = currentProgress.lineOrder.map((lineId) =>
        lineMap.get(lineId)!
      );

      submittedFeedback = {
        isCorrect: currentProgress.correct,
        pointsEarned: currentProgress.score,
        totalScore: game.totalScore,
        correctAnswers: game.correctAnswers,
        explanation: rawQuestion.explanation,
        expectedOutput: rawQuestion.expectedOutput,
        correctCodeOrder: sortedLines.map((l) => ({
          position: l.correctPosition,
          code: l.code
        })),
        submittedArrangement: displayedShuffledLines.map((l) => ({
          lineId: l.id,
          submittedPosition: selectionObj[l.id],
          correctPosition: l.correctPosition,
          code: l.code
        })),
        attempts: currentProgress.attempts,
        gameCompleted:
          currentQIndex >= game.questions.length - 1 && currentProgress.correct,
        currentQuestionIndex: game.currentQuestionIndex,
        totalQuestions: game.questions.length
      };
    }
  }

  return {
    gameId: game._id,
    playerName: game.playerName,
    language: game.language,
    difficulty: game.difficulty,
    selectedTime: game.selectedTime,
    startedAt: game.startedAt,
    expiresAt: game.expiresAt,
    timeRemaining: timeRemainingSeconds,
    currentQuestionIndex: game.currentQuestionIndex,
    totalQuestions: game.questions.length,
    totalScore: game.totalScore,
    correctAnswers: game.correctAnswers,
    completed: game.completed,
    status: game.status,
    currentQuestion: currentQuestionClient,
    submittedFeedback,
    questionHistory: game.questions.map((q, idx) => ({
      index: idx,
      correct: q.correct,
      attempts: q.attempts,
      score: q.score,
      timeTaken: q.timeTaken
    }))
  };
};

export interface SubmitAnswerDTO {
  gameId: string;
  submittedSelection: Record<string, number>; // lineId -> selected position 1..N
}

export const processAnswerSubmission = async (dto: SubmitAnswerDTO) => {
  const game = await Game.findById(dto.gameId).populate('questions.questionId');
  if (!game) {
    throw new Error('Game session not found.');
  }

  const now = new Date();
  if (
    now.getTime() >= new Date(game.expiresAt).getTime() ||
    game.status !== 'active'
  ) {
    game.status = 'expired';
    game.completed = true;
    await game.save();
    throw new Error('Game session has expired.');
  }

  const currentQIndex = game.currentQuestionIndex;
  if (currentQIndex >= game.questions.length) {
    throw new Error('Game has already completed all questions.');
  }

  const progress = game.questions[currentQIndex];
  const question = progress.questionId as any as IQuestion;

  // Validate that all lines have a selection
  const lineIds = question.lines.map((l) => l.id);
  for (const id of lineIds) {
    if (
      !dto.submittedSelection[id] ||
      dto.submittedSelection[id] < 1 ||
      dto.submittedSelection[id] > lineIds.length
    ) {
      throw new Error(`Line ${id} is missing a valid line number selection.`);
    }
  }

  // Verify correctness: every line's submitted position must match correctPosition
  let isCorrect = true;
  for (const line of question.lines) {
    if (dto.submittedSelection[line.id] !== line.correctPosition) {
      isCorrect = false;
      break;
    }
  }

  progress.attempts += 1;
  game.totalAttempts += 1;

  const timeRemaining = Math.max(
    0,
    Math.floor((new Date(game.expiresAt).getTime() - now.getTime()) / 1000)
  );
  const timeTakenForQ = Math.max(
    1,
    Math.floor((now.getTime() - new Date(game.startedAt).getTime()) / 1000) -
      game.timeUsed
  );
  progress.timeTaken += timeTakenForQ;

  let pointsEarned = 0;
  if (isCorrect && !progress.correct) {
    pointsEarned = calculateQuestionScore({
      difficulty: game.difficulty as any,
      questionIndex: currentQIndex,
      isCorrect: true,
      timeTakenForQuestion: progress.timeTaken,
      totalGameTime: game.selectedTime,
      timeRemainingInGame: timeRemaining
    });

    progress.correct = true;
    progress.score = pointsEarned;
    game.totalScore = Math.round((game.totalScore + pointsEarned) * 10) / 10;
    game.correctAnswers += 1;
  }

  progress.submittedSelection = dto.submittedSelection as any;
  progress.submittedAt = now;

  const isLastQuestion = currentQIndex >= game.questions.length - 1;

  await game.save();

  // Correct line order for feedback
  const sortedLines = [...question.lines].sort(
    (a, b) => a.correctPosition - b.correctPosition
  );

  // Shuffled lines order mapping for "Your Answer" vs "Correct Answer"
  const lineMap = new Map(question.lines.map((l) => [l.id, l]));
  const displayedShuffledLines = progress.lineOrder.map((lineId) =>
    lineMap.get(lineId)!
  );

  return {
    isCorrect,
    pointsEarned,
    totalScore: game.totalScore,
    correctAnswers: game.correctAnswers,
    explanation: question.explanation,
    expectedOutput: question.expectedOutput,
    correctCodeOrder: sortedLines.map((l) => ({
      position: l.correctPosition,
      code: l.code
    })),
    submittedArrangement: displayedShuffledLines.map((l) => ({
      lineId: l.id,
      submittedPosition: dto.submittedSelection[l.id],
      correctPosition: l.correctPosition,
      code: l.code
    })),
    attempts: progress.attempts,
    gameCompleted: isLastQuestion && isCorrect,
    currentQuestionIndex: game.currentQuestionIndex,
    totalQuestions: game.questions.length
  };
};

export const advanceToNextQuestion = async (gameId: string) => {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error('Game session not found.');
  }

  const currentQIndex = game.currentQuestionIndex;
  const isLastQuestion = currentQIndex >= game.questions.length - 1;

  if (isLastQuestion) {
    const now = new Date();
    game.completed = true;
    game.status = 'completed';
    game.completedAt = now;
    game.timeUsed = Math.min(
      game.selectedTime,
      Math.floor(
        (now.getTime() - new Date(game.startedAt).getTime()) / 1000
      )
    );
  } else {
    game.currentQuestionIndex += 1;
  }

  await game.save();
  return getGameSessionState(gameId);
};

export const completeGameSession = async (gameId: string) => {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error('Game session not found.');
  }

  if (!game.completed) {
    const now = new Date();
    game.completed = true;
    game.status = 'completed';
    game.completedAt = now;
    game.timeUsed = Math.min(
      game.selectedTime,
      Math.floor(
        (now.getTime() - new Date(game.startedAt).getTime()) / 1000
      )
    );
    await game.save();
  }

  return game;
};

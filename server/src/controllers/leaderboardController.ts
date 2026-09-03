import { Request, Response, NextFunction } from 'express';
import { Game } from '../models/Game.js';

export const getLeaderboardRankings = async (language?: string, difficulty?: string) => {
  const filter: any = {
    completed: true,
    status: { $in: ['completed', 'expired'] }
  };

  if (language && typeof language === 'string' && language !== 'all') {
    filter.language = language;
  }

  if (difficulty && typeof difficulty === 'string' && difficulty !== 'all') {
    filter.difficulty = difficulty;
  }

  const games = await Game.find(filter).lean();
  const diffWeight: Record<string, number> = { hard: 3, moderate: 2, easy: 1 };

  games.sort((a, b) => {
    if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    const weightA = diffWeight[a.difficulty] || 1;
    const weightB = diffWeight[b.difficulty] || 1;
    if (weightB !== weightA) return weightB - weightA;
    if (a.timeUsed !== b.timeUsed) return a.timeUsed - b.timeUsed;
    if (a.selectedTime !== b.selectedTime) return a.selectedTime - b.selectedTime;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return games.map((g, index) => ({
    rank: index + 1,
    gameId: g._id,
    playerName: g.playerName,
    language: g.language,
    difficulty: g.difficulty,
    score: g.totalScore,
    correctAnswers: g.correctAnswers,
    timeUsed: g.timeUsed,
    selectedTime: g.selectedTime,
    playedAt: g.createdAt
  }));
};

/**
 * Deterministic Leaderboard Ranking Algorithm:
 * Priority 1: correctAnswers DESC (More correct answers outrank speed)
 * Priority 2: totalScore DESC (Higher score outranks lower score)
 * Priority 3: difficultyWeight DESC (Hard > Moderate > Easy)
 * Priority 4: timeUsed ASC (Faster time breaks score tie)
 * Priority 5: selectedTime ASC
 * Priority 6: createdAt ASC (Earlier completion time wins)
 */
export const handleGetLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { language, difficulty, limit = 50 } = req.query;
    const rankings = await getLeaderboardRankings(
      typeof language === 'string' ? language : undefined,
      typeof difficulty === 'string' ? difficulty : undefined
    );

    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const sliced = rankings.slice(0, limitNum);

    res.json({
      success: true,
      data: sliced
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Returns player's rank on global leaderboard after game completion.
 */
export const handleGetPlayerRank = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gameId } = req.params;
    const currentGame = await Game.findById(gameId);
    if (!currentGame) {
      return res.status(404).json({ success: false, message: 'Game not found.' });
    }

    const rankings = await getLeaderboardRankings();
    const rankIndex = rankings.findIndex((g) => g.gameId.toString() === currentGame._id.toString());
    const rank = rankIndex !== -1 ? rankIndex + 1 : rankings.length + 1;

    res.json({
      success: true,
      data: {
        rank,
        totalPlayers: rankings.length,
        gameId: currentGame._id,
        playerName: currentGame.playerName,
        score: currentGame.totalScore,
        correctAnswers: currentGame.correctAnswers,
        timeUsed: currentGame.timeUsed,
        selectedTime: currentGame.selectedTime,
        difficulty: currentGame.difficulty,
        language: currentGame.language
      }
    });
  } catch (error: any) {
    next(error);
  }
};

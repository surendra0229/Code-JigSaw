export const BASE_QUESTION_POINTS: Record<string, number[]> = {
  easy: [5, 5, 6, 7, 8],
  moderate: [6, 7, 8, 9, 10],
  hard: [8, 8, 9, 10, 10]
};

export interface CalculateScoreParams {
  difficulty: 'easy' | 'moderate' | 'hard';
  questionIndex: number;
  isCorrect: boolean;
  timeTakenForQuestion: number;
  totalGameTime: number;
  timeRemainingInGame: number;
}

/**
 * Calculates score for a question attempt.
 * Correctness is heavily weighted.
 * Time speed adds a small bonus scaling down from 100% to 60% of base points.
 */
export const calculateQuestionScore = (params: CalculateScoreParams): number => {
  const { difficulty, questionIndex, isCorrect, timeRemainingInGame, totalGameTime } = params;

  if (!isCorrect) {
    return 0;
  }

  const difficultyScores = BASE_QUESTION_POINTS[difficulty] || BASE_QUESTION_POINTS.easy;
  const basePoints = difficultyScores[Math.min(questionIndex, 4)] || 5;

  // Time remaining factor: ratio between 0 and 1
  const timeFactor = Math.max(0, Math.min(1, timeRemainingInGame / totalGameTime));
  
  // Award between 60% and 100% of base points based on speed
  const calculatedPoints = basePoints * (0.6 + (0.4 * timeFactor));

  // Round to 1 decimal place or nearest integer
  return Math.round(calculatedPoints * 10) / 10;
};

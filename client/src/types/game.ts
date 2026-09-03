export type DifficultyLevel = 'easy' | 'moderate' | 'hard';

export interface CodeLineItem {
  id: string;
  code: string;
}

export interface QuestionData {
  title: string;
  description: string;
  language: string;
  difficulty: DifficultyLevel;
  lines: CodeLineItem[];
  totalLines: number;
}

export interface QuestionHistoryItem {
  index: number;
  correct: boolean;
  attempts: number;
  score: number;
  timeTaken: number;
}

export interface GameState {
  gameId: string;
  playerName: string;
  language: string;
  difficulty: DifficultyLevel;
  selectedTime: number;
  startedAt: string;
  expiresAt: string;
  timeRemaining: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  totalScore: number;
  correctAnswers: number;
  completed: boolean;
  status: 'active' | 'completed' | 'expired';
  currentQuestion: QuestionData | null;
  submittedFeedback?: AnswerFeedback | null;
  questionHistory: QuestionHistoryItem[];
}

export interface CodeOrderFeedback {
  position: number;
  code: string;
}

export interface SubmittedArrangementFeedback {
  lineId?: string;
  submittedPosition: number;
  correctPosition?: number;
  code: string;
}

export interface AnswerFeedback {
  isCorrect: boolean;
  pointsEarned: number;
  totalScore: number;
  correctAnswers: number;
  explanation: string;
  expectedOutput?: string;
  correctCodeOrder: CodeOrderFeedback[];
  submittedArrangement: SubmittedArrangementFeedback[];
  attempts: number;
  gameCompleted: boolean;
  currentQuestionIndex?: number;
  totalQuestions?: number;
}

export interface SimulationStep {
  stepNumber: number;
  lineId: string;
  lineNumber: number;
  code: string;
  variables: Record<string, any>;
  output: string;
  explanation: string;
}

export interface SimulationResult {
  supported: boolean;
  language: string;
  message?: string;
  steps: SimulationStep[];
}

export interface LeaderboardItem {
  rank: number;
  gameId: string;
  playerName: string;
  language: string;
  difficulty: DifficultyLevel;
  score: number;
  correctAnswers: number;
  timeUsed: number;
  selectedTime: number;
  playedAt: string;
}

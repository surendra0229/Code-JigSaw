import { Schema, model, Document, Types } from 'mongoose';

export interface IQuestionProgress {
  questionId: Types.ObjectId;
  lineOrder: string[]; // Shuffled line IDs given to client
  submittedSelection?: Record<string, number>; // lineId -> chosenPosition (1-based)
  attempts: number;
  correct: boolean;
  timeTaken: number; // in seconds
  score: number;
  submittedAt?: Date;
}

export interface IGame extends Document {
  playerName: string;
  language: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  selectedTime: number; // in seconds
  startedAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  currentQuestionIndex: number;
  questions: IQuestionProgress[];
  totalScore: number;
  correctAnswers: number;
  totalAttempts: number;
  timeUsed: number; // in seconds
  completed: boolean;
  status: 'active' | 'completed' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const QuestionProgressSchema = new Schema<IQuestionProgress>({
  questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  lineOrder: [{ type: String }],
  submittedSelection: { type: Map, of: Number },
  attempts: { type: Number, default: 0 },
  correct: { type: Boolean, default: false },
  timeTaken: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  submittedAt: { type: Date }
}, { _id: false });

const GameSchema = new Schema<IGame>({
  playerName: { type: String, required: true, trim: true },
  language: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['easy', 'moderate', 'hard'] },
  selectedTime: { type: Number, required: true },
  startedAt: { type: Date, required: true, default: Date.now },
  expiresAt: { type: Date, required: true },
  completedAt: { type: Date },
  currentQuestionIndex: { type: Number, default: 0 },
  questions: [QuestionProgressSchema],
  totalScore: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  totalAttempts: { type: Number, default: 0 },
  timeUsed: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'completed', 'expired'], default: 'active', index: true }
}, {
  timestamps: true
});

GameSchema.index({ totalScore: -1, correctAnswers: -1, timeUsed: 1 });
GameSchema.index({ playerName: 1, createdAt: -1 });

export const Game = model<IGame>('Game', GameSchema);

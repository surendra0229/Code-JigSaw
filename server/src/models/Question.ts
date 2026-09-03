import { Schema, model, Document } from 'mongoose';

export interface ICodeLine {
  id: string;
  code: string;
  correctPosition: number;
}

export interface IQuestion extends Document {
  title: string;
  description: string;
  language: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  lines: ICodeLine[];
  expectedOutput: string;
  explanation: string;
  points: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CodeLineSchema = new Schema<ICodeLine>({
  id: { type: String, required: true },
  code: { type: String, required: true },
  correctPosition: { type: Number, required: true }
}, { _id: false });

const QuestionSchema = new Schema<IQuestion>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  language: { type: String, required: true, index: true },
  difficulty: { type: String, required: true, enum: ['easy', 'moderate', 'hard'], index: true },
  lines: [CodeLineSchema],
  expectedOutput: { type: String, default: '' },
  explanation: { type: String, default: '' },
  points: { type: Number, default: 5 },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

QuestionSchema.index({ language: 1, difficulty: 1, active: 1 });

export const Question = model<IQuestion>('Question', QuestionSchema);

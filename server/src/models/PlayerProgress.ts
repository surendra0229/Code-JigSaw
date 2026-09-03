import { Schema, model, Document, Types } from 'mongoose';

/**
 * PlayerProgress tracks the set of question IDs already seen by a player
 * for each (language, difficulty) combination.
 *
 * playerIdentifier: MongoDB player _id (for registered accounts) or
 *                   sanitized playerName string (for guests).
 *
 * Cycle logic: when seenQuestionIds reaches the total pool for that
 * language+difficulty, the field is reset to [] so questions repeat
 * from the beginning (full cycle restart).
 */
export interface IPlayerProgress extends Document {
  playerIdentifier: string;
  language: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  seenQuestionIds: Types.ObjectId[];
  totalSeen: number;
  cyclesCompleted: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerProgressSchema = new Schema<IPlayerProgress>(
  {
    playerIdentifier: { type: String, required: true, trim: true },
    language: { type: String, required: true, trim: true, lowercase: true },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'moderate', 'hard']
    },
    seenQuestionIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    totalSeen: { type: Number, default: 0 },
    cyclesCompleted: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

// Composite unique index: one progress record per player per language+difficulty
PlayerProgressSchema.index(
  { playerIdentifier: 1, language: 1, difficulty: 1 },
  { unique: true }
);

export const PlayerProgress = model<IPlayerProgress>(
  'PlayerProgress',
  PlayerProgressSchema
);

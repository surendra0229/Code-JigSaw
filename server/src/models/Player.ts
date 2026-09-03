import { Schema, model, Document } from 'mongoose';

export interface IPlayer extends Document {
  playerName: string;
  email: string;
  passwordHash: string;
  role: 'player';
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema = new Schema<IPlayer>({
  playerName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['player'], default: 'player' }
}, {
  timestamps: true
});

PlayerSchema.index({ email: 1 });

export const Player = model<IPlayer>('Player', PlayerSchema);

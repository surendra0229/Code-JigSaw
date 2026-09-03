import { Schema, model, Document } from 'mongoose';

export interface IAdmin extends Document {
  email: string;
  userId: string;
  displayName: string;
  passwordHash: string;
  role: 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  userId: { type: String, required: true, unique: true, trim: true },
  displayName: { type: String, required: true, default: 'Admin', trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin'], default: 'admin' }
}, {
  timestamps: true
});

AdminSchema.index({ email: 1 });
AdminSchema.index({ userId: 1 });

export const Admin = model<IAdmin>('Admin', AdminSchema);

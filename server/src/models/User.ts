// /server/src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

// Define the TypeScript Interface for User Document
export interface IUser extends Document {
  email: string;
  passwordHash: string; // The hashed password
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  healthGoals: string[]; // For personalization
  avatarUrl?: string;
  phone?: string;
  disabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false }, // 'select: false' prevents it from being returned by default queries
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    healthGoals: [{ type: String }],
    avatarUrl: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
  { timestamps: true }
);

// Export the Mongoose Model
const User = mongoose.model<IUser>('User', UserSchema);
export default User;
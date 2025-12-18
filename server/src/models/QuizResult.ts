// /server/src/models/QuizResult.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

// Define the health goals/concerns we'll track (must match our Product keyBenefits/categories)
export type HealthGoal = 'Energy' | 'Immunity' | 'Joint Health' | 'Sleep' | 'Digestion' | 'Stress';

export interface IQuizResult extends Document {
  user: Types.ObjectId; // Link to the user who took the quiz
  dateTaken: Date;
  selectedGoals: HealthGoal[]; // The key goals chosen by the user
  dietaryRestrictions: string[]; // e.g., ['Vegan', 'Gluten-Free']
  age: number;
  score: number; // A potential overall score (e.g., for recommendation weighting)
}

const QuizResultSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dateTaken: { type: Date, default: Date.now },
    selectedGoals: [{ type: String, enum: ['Energy', 'Immunity', 'Joint Health', 'Sleep', 'Digestion', 'Stress'], required: true }],
    dietaryRestrictions: [{ type: String }],
    age: { type: Number, min: 18, required: true },
    score: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const QuizResult = mongoose.model<IQuizResult>('QuizResult', QuizResultSchema);
export default QuizResult;
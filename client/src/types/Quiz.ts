// /client/src/types/Quiz.ts
// /client/src/types/Quiz.ts
import type { Product } from './Product';

export type HealthGoal = 'Energy' | 'Immunity' | 'Joint Health' | 'Sleep' | 'Digestion' | 'Stress';

export interface QuizPayload {
  selectedGoals: HealthGoal[];
  dietaryRestrictions: string[];
  age: number;
}

export interface RecommendationResponse {
  message: string;
  recommendations: Product[];
}
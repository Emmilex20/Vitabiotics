// /client/src/api/quizApi.ts
import axios from 'axios';
import type { QuizPayload, RecommendationResponse } from '../types/Quiz';
import type { User } from '../types/Auth';

const API_URL = 'http://localhost:5000/api/quiz';

// Helper to get auth header
const getConfig = (token: string) => ({
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
});

export const quizApi = {
  submitQuiz: async (payload: QuizPayload, user: User): Promise<void> => {
    await axios.post(`${API_URL}/submit`, payload, getConfig(user.token));
  },

  getRecommendations: async (user: User): Promise<RecommendationResponse> => {
    const response = await axios.get(`${API_URL}/recommendations`, getConfig(user.token));
    return response.data;
  },
};
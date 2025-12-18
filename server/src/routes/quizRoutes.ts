// /server/src/routes/quizRoutes.ts
import express from 'express';
import { submitQuiz, getRecommendations } from '../controllers/quizController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All quiz routes require authentication
router.post('/submit', protect, submitQuiz);
router.get('/recommendations', protect, getRecommendations);

export default router;
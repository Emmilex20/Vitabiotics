// /server/src/controllers/quizController.ts
import { Request, Response } from 'express';
import QuizResult, { HealthGoal } from '../models/QuizResult';
import Product, { IProduct } from '../models/Product';
import { protect, AuthRequest } from '../middleware/authMiddleware'; 
import User from '../models/User';

// @desc    Submit quiz results and update user profile
// @route   POST /api/quiz/submit
// @access  Private
export const submitQuiz = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const { selectedGoals, dietaryRestrictions, age } = req.body;

  if (!selectedGoals || !age) {
    return res.status(400).json({ message: 'Missing required quiz fields.' });
  }

  try {
    // 1. Save Quiz Result
    const quizResult = await QuizResult.create({
      user: req.user._id,
      selectedGoals,
      dietaryRestrictions: dietaryRestrictions || [],
      age,
      // Score calculation can be added here based on age/restrictions if needed
    });

    // 2. Update User Profile's healthGoals
    await User.findByIdAndUpdate(req.user._id, {
        healthGoals: selectedGoals,
    });

    res.status(201).json({ message: 'Quiz submitted successfully. Profile updated.', quizId: quizResult._id });

  } catch (error: any) {
    console.error('Quiz submission failed:', error);
    res.status(500).json({ message: 'Server error saving quiz data.' });
  }
};


// @desc    Get product recommendations based on user's current goals
// @route   GET /api/quiz/recommendations
// @access  Private
export const getRecommendations = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    // 1. Get the user's latest goals from the User model (updated by submitQuiz)
    const user = await User.findById(req.user._id);
    const userGoals = (user?.healthGoals || []) as string[];

    if (userGoals.length === 0) {
        return res.json({ message: 'No goals set. Please take the quiz.', recommendations: [] });
    }

    // 2. Find Products that match the user's selected goals
    // We search products where any element in keyBenefits matches any element in userGoals.
    const recommendations = await Product.find({
        keyBenefits: { $in: userGoals },
    }).limit(5).sort({ averageRating: -1 }); // Limit to top 5, sorted by rating

    res.json({
        message: `Found ${recommendations.length} recommendations matching your goals: ${userGoals.join(', ')}`,
        recommendations,
    });

  } catch (error) {
    console.error('Recommendation fetching failed:', error);
    res.status(500).json({ message: 'Server error fetching recommendations.' });
  }
};
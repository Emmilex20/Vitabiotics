import express from 'express';
import { verifyPaystackPayment, getPaystackInitData, getPaystackStatus } from '../controllers/paymentController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Public route for initialization
router.get('/initialize', getPaystackInitData);

// Protected admin routes
router.get('/status', protect, admin, getPaystackStatus);
router.post('/verify-paystack', protect, verifyPaystackPayment);

export default router;

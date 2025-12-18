import express from 'express';
import { createShipmentTracker, handleWebhook } from '../controllers/shippingController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Admin creates tracker for an order
router.post('/create', protect, admin, createShipmentTracker);
// Webhook endpoint (public)
router.post('/webhook', express.raw({ type: '*/*' }), handleWebhook);

export default router;

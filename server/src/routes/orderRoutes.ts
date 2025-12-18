// /server/src/routes/orderRoutes.ts
import express from 'express';
import { addOrderItems, getMyOrders, getAllOrders, updateOrderStatus, getOrderById, updateOrderTracking } from '../controllers/orderController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Private routes (requires login)
router.route('/').post(protect, addOrderItems);
router.route('/myorders').get(protect, getMyOrders);

// Admin routes (requires admin role)
router.route('/').get(protect, admin, getAllOrders);
router.route('/:id').get(protect, getOrderById).put(protect, admin, updateOrderStatus);
router.route('/:id/tracking').put(protect, admin, updateOrderTracking);

export default router;
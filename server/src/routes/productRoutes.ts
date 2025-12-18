// /server/src/routes/productRoutes.ts
import express from 'express';
import { getProducts, getProductByIdOrSlug, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Public Routes
router.route('/').get(getProducts);
router.route('/:idOrSlug').get(getProductByIdOrSlug);

// Admin Routes (Requires Auth and Admin role)
router.route('/').post(protect, admin, createProduct);
router.route('/:id').put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);

export default router;
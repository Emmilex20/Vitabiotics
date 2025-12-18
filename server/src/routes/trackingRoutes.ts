import express from 'express';
import { getTrackingByNumber } from '../controllers/orderController';

const router = express.Router();

router.get('/:trackingNumber', getTrackingByNumber);

export default router;

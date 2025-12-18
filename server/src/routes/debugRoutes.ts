import express from 'express';
import { inspectToken } from '../controllers/debugController';

const router = express.Router();

// Development-only debug endpoint
router.get('/token', inspectToken);

export default router;
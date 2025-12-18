// /server/src/server.ts (Final Update - Backend)
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes'; 
import productRoutes from './routes/productRoutes'; 
import orderRoutes from './routes/orderRoutes'; 
import quizRoutes from './routes/quizRoutes'; // <-- New Import
import paymentRoutes from './routes/paymentRoutes'; // <-- Paystack Payment Routes
import trackingRoutes from './routes/trackingRoutes';
import shippingRoutes from './routes/shippingRoutes';
import adminTrackingRoutes from './routes/adminTrackingRoutes';
import adminUserRoutes from './routes/adminUserRoutes';
import debugRoutes from './routes/debugRoutes'; // development-only debug routes
import { startTrackingPoller } from './utils/trackingPoller';

dotenv.config();

connectDB(); 

const app = express();

// Middleware
app.use(express.json()); 
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}));         

// Root Route
app.get('/', (req: Request, res: Response) => {
  res.send('Vitabiotics API is running...');
});

// --- API Routes ---
app.use('/api/users', userRoutes); 
app.use('/api/products', productRoutes); 
app.use('/api/orders', orderRoutes); 
app.use('/api/quiz', quizRoutes); // <-- New Route Use
app.use('/api/payments', paymentRoutes); // <-- Paystack Payment Routes

// Development-only debug routes (inspect token payloads)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/debug', debugRoutes);
}

// Tracking lookup (public)
app.use('/api/tracking', trackingRoutes);
// Shipping routes (create tracker, webhook)
app.use('/api/shipping', shippingRoutes);
// Admin tracking routes
app.use('/api/admin/orders', adminTrackingRoutes);
// Admin user management
app.use('/api/admin/users', adminUserRoutes);

// Start poller (mock/simple) only in non-test env
if (process.env.NODE_ENV !== 'test') {
  startTrackingPoller();
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`⚡ Server running in development mode on port ${PORT}`));
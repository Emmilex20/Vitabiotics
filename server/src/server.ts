import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';

import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import quizRoutes from './routes/quizRoutes';
import paymentRoutes from './routes/paymentRoutes';
import trackingRoutes from './routes/trackingRoutes';
import shippingRoutes from './routes/shippingRoutes';
import adminTrackingRoutes from './routes/adminTrackingRoutes';
import adminUserRoutes from './routes/adminUserRoutes';
import debugRoutes from './routes/debugRoutes';
import { startTrackingPoller } from './utils/trackingPoller';

dotenv.config();

// 🔌 Connect DB
connectDB();

const app = express();

/* =========================
   MIDDLEWARE
========================= */

// Parse JSON bodies
app.use(express.json());

// ✅ Allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173',              // Dev
  'https://vitabiotics.vercel.app'       // Production
];

// ✅ CORS config (PRODUCTION SAFE)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, Postman, curl
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Explicitly handle preflight requests
app.options('*', cors());

/* =========================
   ROOT
========================= */

app.get('/', (req: Request, res: Response) => {
  res.send('✅ Vitabiotics API is running...');
});

/* =========================
   API ROUTES
========================= */

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/payments', paymentRoutes);

// Public tracking
app.use('/api/tracking', trackingRoutes);

// Shipping
app.use('/api/shipping', shippingRoutes);

// Admin routes
app.use('/api/admin/orders', adminTrackingRoutes);
app.use('/api/admin/users', adminUserRoutes);

// Dev-only debug routes
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/debug', debugRoutes);
}

/* =========================
   BACKGROUND TASKS
========================= */

if (process.env.NODE_ENV !== 'test') {
  startTrackingPoller();
}

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`⚡ Server running on port ${PORT}`);
});

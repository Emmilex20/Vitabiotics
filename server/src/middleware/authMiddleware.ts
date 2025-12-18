// /server/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

// Define a type that extends the Request object to include the user
export interface AuthRequest extends Request {
  user?: IUser; 
}

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to protect routes (ensure user is logged in)
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token || token.length === 0) {
        return res.status(401).json({ message: 'No token provided' });
      }

      if (!JWT_SECRET) {
        throw new Error('JWT_SECRET not configured.');
      }

      // Decode token and get user ID
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      // Fetch user data (excluding password hash)
      const user = await User.findById(decoded.id).select('-passwordHash');

      if (!user) {
        return res.status(401).json({ message: 'User not found. Token failed.' });
      }

      // Attach user to the request object
      req.user = user;
      next();

    } catch (error: any) {
      // Avoid printing full stack traces for token errors; log concise message
      const msg = error?.message || 'Token verification failed';
      console.warn('Auth middleware:', msg);
      // If the token is malformed or invalid, respond with a clear 401
      return res.status(401).json({ message: msg.includes('jwt') ? 'Invalid token' : 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to restrict routes to Admin users
export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
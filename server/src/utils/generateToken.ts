// /server/src/utils/generateToken.ts
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// JWT_SECRET is loaded from .env
const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (id: Types.ObjectId): string => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }

  // The payload should contain minimal, non-sensitive identifying data (e.g., user ID)
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

export default generateToken;
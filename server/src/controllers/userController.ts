// /server/src/controllers/userController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import { AuthRequest } from '../middleware/authMiddleware';

// Utility function to handle Response with Token and User Data
const sendAuthResponse = (res: Response, user: any) => {
    // Note: Mongoose virtuals/getters/transforms can be used here 
    // to clean up the user object before sending (e.g., removing passwordHash)
    // For now, we manually exclude sensitive fields in the query or model.

    const token = generateToken(user._id);
    
    res.status(200).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token: token,
        healthGoals: user.healthGoals,
    });
};


// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    res.status(400).json({ message: 'Please enter all fields' });
    return;
  }

  try {
    // 1. Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Create User
    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      // Default role is 'user', healthGoals is empty []
    });

    if (user) {
      sendAuthResponse(res, user);
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};


// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // 1. Find user, explicitly select passwordHash
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // 2. Compare password
    // NOTE: If user is found, the `passwordHash` field is available because of `.select('+passwordHash')`
    const isMatch = await bcrypt.compare(password, user.passwordHash as string);

    if (user && isMatch) {
      // 3. Send successful response with token
      sendAuthResponse(res, user);
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    // Guard: user should be attached by auth middleware
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authorized' });

    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl || null,
      healthGoals: user.healthGoals,
    });
  } catch (error: any) {
    console.error('getUserProfile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authorized' });

    const { firstName, lastName, healthGoals, avatarUrl } = req.body;

    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (Array.isArray(healthGoals)) user.healthGoals = healthGoals;
    if (avatarUrl) user.avatarUrl = avatarUrl;

    // Save and return updated user (without password)
    await user.save();

    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      healthGoals: user.healthGoals,
      avatarUrl: user.avatarUrl || null,
      token: generateToken(user._id),
    });
  } catch (error: any) {
    console.error('updateUserProfile error:', error.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};
#!/usr/bin/env ts-node
// /server/scripts/makeAdmin.ts
// Usage: npx ts-node scripts/makeAdmin.ts <email>

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

dotenv.config();

const makeUserAdmin = async (email: string) => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`❌ User with email "${email}" not found.`);
      process.exit(1);
    }

    // Update user role to admin
    user.role = 'admin';
    await user.save();

    console.log(`✅ User "${user.firstName} ${user.lastName}" (${email}) is now an ADMIN`);
    console.log(`Role: ${user.role}`);
    console.log(`User ID: ${user._id}`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('Usage: npx ts-node scripts/makeAdmin.ts <email>');
  console.log('Example: npx ts-node scripts/makeAdmin.ts user@example.com');
  process.exit(1);
}

makeUserAdmin(email);

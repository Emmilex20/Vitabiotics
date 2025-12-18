#!/usr/bin/env ts-node
// /server/scripts/listUsers.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

dotenv.config();

const listUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find().select('email firstName lastName role createdAt');

    if (users.length === 0) {
      console.log('❌ No users found in database.');
    } else {
      console.log(`📋 Total Users: ${users.length}\n`);
      console.table(users.map((u) => ({
        'Email': u.email,
        'Name': `${u.firstName} ${u.lastName}`,
        'Role': u.role,
        'Created': new Date(u.createdAt).toLocaleDateString(),
      })));
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

listUsers();

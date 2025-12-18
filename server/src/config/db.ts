// /server/src/config/db.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error("MONGO_URI is not defined in environment variables.");
    }

    // Attempt to connect to MongoDB
    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
        console.error(`❌ Error connecting to DB: ${error.message}`);
    } else {
        console.error(`❌ An unknown error occurred during database connection`);
    }
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
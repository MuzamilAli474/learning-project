import mongoose from 'mongoose';
import { config } from './index.js'; 

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoose.url);
    console.log(`[DB] Connected to ${config.env}`);
  } catch (error) {
    console.error('[DB] Connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
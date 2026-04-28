import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// In ESM, __dirname is not available by default, so we define it:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, `../../.env.${process.env.NODE_ENV || 'development'}`);
dotenv.config({ path: envPath });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  mongoose: {
    url: process.env.MONGODB_URL,
  },
};
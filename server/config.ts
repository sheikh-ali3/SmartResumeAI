import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from env.local file
dotenv.config({ path: join(__dirname, '../env.local') });

// Export environment variables for use throughout the application
export const config = {
  DATABASE_URL: process.env.DATABASE_URL,
  REPLIT_DOMAINS: process.env.REPLIT_DOMAINS,
  ISSUER_URL: process.env.ISSUER_URL,
  REPL_ID: process.env.REPL_ID,
  SESSION_SECRET: process.env.SESSION_SECRET,
  PORT: process.env.PORT || '3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

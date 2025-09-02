import dotenv from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

// validate config
const requiredEnv = ['FB_USER', 'FB_PASS'];
for (const envVar of requiredEnv) {
  if (!process.env[envVar]) {
    throw new Error(
      `Missing required environment variable: ${envVar}\nPlease see .env.example for more info.`
    );
  }
}

// directories
export const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../../');
export const UPLOADS_DIR = join(ROOT_DIR, '/database/uploads');
export const PTR_SESSION_DIR = join(ROOT_DIR, '/database/puppeteer-session');

// env
export const PORT = parseInt(process.env.PORT || '3000');
export const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

export const HEADLESS_MODE = process.env.HEADLESS_MODE === 'true';
export const FB_USER = process.env.FB_USER!;
export const FB_PASS = process.env.FB_PASS!;
export const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
export const REDIS_PORT = process.env.REDIS_PORT
  ? Number(process.env.REDIS_PORT)
  : 6379;
export const REDIS_USER = process.env.REDIS_USER;
export const REDIS_PASS = process.env.REDIS_PASS;

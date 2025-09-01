import dotenv from 'dotenv';

dotenv.config();

// validate config
const requiredEnv = ['USERNAME', 'PASSWORD'];
for (const envVar of requiredEnv) {
  if (!process.env[envVar]) {
    throw new Error(
      `Missing required environment variable: ${envVar}\nPlease see .env.example for more info.`
    );
  }
}

export const USERNAME = process.env.USERNAME!;
export const PASSWORD = process.env.PASSWORD!;

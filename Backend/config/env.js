/**
 * config/env.js
 *
 * Centralized environment variable validation.
 */
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  // Server
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:3000'),

  // Database
  MONGODB_URI: z.string().url('MONGODB_URI must be a valid connection string'),

  // Secrets
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES: z.string().default('7d'),
  BCRYPT_ROUNDS: z.string().transform(v => parseInt(v)).default('12'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  // AI
  OPENAI_API_KEY: z.string().optional(),

  // Payments
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
}).passthrough(); // allows other variables without failing

const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (e) {
    console.error('❌ [CONFIG ERROR] Invalid environment variables:');
    e.errors.forEach(err => {
      console.error(`   - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
};

export const env = validateEnv();
export default env;

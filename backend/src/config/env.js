import { z } from 'zod'
import dotenv from 'dotenv'

// Only load .env file in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT:     z.string().default('5000'),

  MONGO_URI:          z.string().url(),
  REDIS_URL:          z.string().url(),

  JWT_SECRET:         z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY:  z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  CLIENT_URLS: z.string().default('http://localhost:5173'),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY:    z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  FCM_PROJECT_ID:   z.string().optional(),
  FCM_CLIENT_EMAIL: z.string().optional(),
  FCM_PRIVATE_KEY:  z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
export const allowedOrigins = env.CLIENT_URLS.split(',').map(o => o.trim())
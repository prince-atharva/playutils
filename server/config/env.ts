import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().transform(Number).optional(),
  NEXTAUTH_URL:z.string().min(10),
  NEXTAUTH_SECRET:z.string().min(10),
  MONGODB_URI:z.string().min(10),
  GOOGLE_CLIENT_ID:z.string().min(10),
  GOOGLE_CLIENT_SECRET:z.string().min(10),
  GITHUB_CLIENT_ID:z.string().min(10),
  GITHUB_CLIENT_SECRET:z.string().min(10),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format())
  process.exit(1)
}

export const env = parsedEnv.data
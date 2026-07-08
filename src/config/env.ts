import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_ORIGIN: z.string().url(),

  SUPABASE_URL: z.string().url(),
  SUPABASE_SECRET_KEY: z.string().min(1),
  SUPABASE_JWKS_URL: z.string().url(),

  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().default('rove-hire'),
  R2_ENDPOINT: z.string().url(),

  MAGIC_LINK_TTL_DAYS: z.coerce.number().default(14),
  SIGNED_URL_TTL_SECONDS: z.coerce.number().default(300),
  MAX_RESUME_MB: z.coerce.number().default(10),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = JSON.stringify(parsed.error.flatten().fieldErrors, null, 2);
  process.stderr.write(`Invalid environment variables:\n${details}\n`);
  process.exit(1);
}

export const env = parsed.data;

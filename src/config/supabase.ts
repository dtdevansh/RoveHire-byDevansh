import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// API8: the secret key bypasses Row Level Security — server-only, never exposed to clients.
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

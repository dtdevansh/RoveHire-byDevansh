import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// API8: service-role key bypasses Row Level Security — server-only, never exposed to clients.
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Supabase client using the service-role key.
 * This bypasses Row Level Security — use only on the server.
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

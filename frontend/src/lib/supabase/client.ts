import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    return new Proxy({} as SupabaseClient, {
      get(_target, prop) {
        if (prop === 'auth') {
          return {
            getSession: () =>
              Promise.resolve({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({
              data: { subscription: { unsubscribe: () => {} } },
            }),
            signInWithPassword: () =>
              Promise.resolve({
                data: { session: null, user: null },
                error: new Error('Supabase not configured'),
              }),
            signOut: () => Promise.resolve({ error: null }),
          };
        }
        return undefined;
      },
    });
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createSupabaseClient();

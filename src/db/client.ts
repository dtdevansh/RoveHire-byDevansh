import { supabase } from '../config/supabase.js';

/**
 * Exported query interface wrapping @supabase/supabase-js.
 *
 * All database access flows through this module. If you ever need to
 * swap to Drizzle, Prisma, or raw pg, this is the single file to change.
 *
 * Re-exports the supabase client for direct use in services.
 * SQL injection is handled by the parameterized query layer — never
 * string-concatenate SQL.
 */
export const db = supabase;

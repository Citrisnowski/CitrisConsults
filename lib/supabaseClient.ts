import { createClient } from '@supabase/supabase-js';

/**
 * Create a single Supabase client for the browser. The anonymous key is
 * deliberately loaded from the environment at runtime (NEXT_PUBLIC_*) so
 * that it can be exposed safely on the client. See the README for
 * instructions on configuring these values.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
import { supabase } from './supabaseClient';

/**
 * Helper functions related to authentication. On the client we can access
 * the Supabase instance directly. If you require server‑side helpers
 * (e.g. reading the session in a server component), consider using
 * `@supabase/auth-helpers-nextjs` in your own project. Here we expose a
 * minimal wrapper around the client API for consistency.
 */

/** Returns the current user or null if not authenticated */
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
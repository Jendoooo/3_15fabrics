import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { Database } from './types';

// Use safe fallbacks so `next build` doesn't crash when env vars aren't set
// (e.g. Vercel build before env vars are configured in project settings).
// At runtime, real values are always present.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key';
// SUPABASE_SERVICE_ROLE_KEY is server-only (no NEXT_PUBLIC_ prefix).
// Falls back to anon key in the browser so module init doesn't crash;
// supabaseServer must only be called from API routes / server components.
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey;

// Singleton pattern for browser client — prevents "Multiple GoTrueClient instances"
// warning caused by HMR re-importing this module in dev mode.
const globalForSupabase = globalThis as unknown as {
  _supabaseBrowser: SupabaseClient<Database> | undefined;
};

export const supabaseBrowser: SupabaseClient<Database> =
  globalForSupabase._supabaseBrowser ??
  createClient<Database>(supabaseUrl, supabaseAnonKey);

if (process.env.NODE_ENV !== 'production') {
  globalForSupabase._supabaseBrowser = supabaseBrowser;
}

// Client for server environments/API routes (bypasses RLS)
export const supabaseServer = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

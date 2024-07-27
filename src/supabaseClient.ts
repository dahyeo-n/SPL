import { createClient, SupabaseClient } from '@supabase/supabase-js';

const NEXT_PUBLIC_SUPABASE_URL: string | undefined =
  process.env.NEXT_PUBLIC_SUPABASE_URL;
const NEXT_PUBLIC_SUPABASE_ANON_KEY: string | undefined =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase: SupabaseClient = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default supabase;

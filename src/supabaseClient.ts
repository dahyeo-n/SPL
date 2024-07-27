import { createClient, SupabaseClient } from '@supabase/supabase-js';

const NEXT_SUPABASE_URL: string | undefined = process.env.NEXT_SUPABASE_URL;
const NEXT_SUPABASE_ANON_KEY: string | undefined =
  process.env.NEXT_SUPABASE_ANON_KEY;

if (!NEXT_SUPABASE_URL || !NEXT_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase: SupabaseClient = createClient(
  NEXT_SUPABASE_URL,
  NEXT_SUPABASE_ANON_KEY
);

export default supabase;

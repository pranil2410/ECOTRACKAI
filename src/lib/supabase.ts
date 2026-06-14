import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Export a function or direct instance. 
// If they are missing, the DB service will route requests to LocalStorage instead.
export const isSupabaseConfigured = () => {
  return (
    typeof window !== 'undefined' &&
    supabaseUrl.length > 0 &&
    supabaseAnonKey.length > 0 &&
    supabaseUrl !== 'your_supabase_url' &&
    supabaseAnonKey !== 'your_supabase_anon_key'
  );
};

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

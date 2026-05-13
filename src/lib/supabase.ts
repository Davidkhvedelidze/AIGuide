import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import type { SupabaseDatabase } from '@/features/landmarks/types/supabase';

export const supabase = createClient<SupabaseDatabase>(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // It's okay to fail hard in development if these are fetching empty strings, 
    // but for the sake of the "local-first" approach, we might want to handle this gracefully
    // if the user hasn't set them up yet. 
    // For now, we'll log a warning and the client creation might fail or be invalid.
    console.warn('Supabase URL or Anon Key is missing. Supabase functionality will be disabled.');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);

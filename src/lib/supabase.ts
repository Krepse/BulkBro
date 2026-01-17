import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = supabaseUrl &&
    supabaseUrl !== 'YOUR_SUPABASE_URL_HERE' &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE';

export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        auth: {
            getSession: async () => {
                console.error('Supabase not configured correctly.');
                return { data: { session: null }, error: new Error('Supabase not configured') };
            },
            onAuthStateChange: () => {
                return { data: { subscription: { unsubscribe: () => { } } } };
            },
            signInWithPassword: async () => ({ error: new Error('Supabase not configured. Check .env file.') }),
            signUp: async () => ({ error: new Error('Supabase not configured. Check .env file.') }),
            signOut: async () => ({ error: new Error('Supabase not configured') }),
        },
        from: (table: string) => {
            const err = new Error(`Supabase not configured. Cannot query table '${table}'.`);
            const fail = {
                select: () => ({ data: null, error: err }),
                insert: () => ({ select: () => ({ data: null, error: err }) }),
                update: () => ({ eq: () => ({ select: () => ({ data: null, error: err }) }) }),
                delete: () => ({ eq: () => ({ error: err }) }),
                upsert: () => ({ select: () => ({ data: null, error: err }) }),
            };
            return fail;
        }
    } as any;


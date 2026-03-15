import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Mock client for local testing without .env setup
const mockSupabase = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithOAuth: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        limit: async () => ({ data: [], error: null }),
        order: async () => ({ data: [], error: null })
      }),
      gt: () => ({
        order: async () => ({ data: [], error: null }),
        limit: async () => ({ data: [], error: null })
      }),
      order: () => ({
        limit: async () => ({ data: [], error: null })
      })
    }),
    insert: async () => ({ error: null }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: async () => ({ data: null, error: null })
        })
      })
    })
  })
} as any;

export const supabase = (supabaseUrl && supabaseUrl !== 'your-project-url') 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : mockSupabase;

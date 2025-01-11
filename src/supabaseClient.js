import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  }
}) 

// Remove console logs in production
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
  // Don't log the key, even in development
  console.log('Supabase key configured:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
}
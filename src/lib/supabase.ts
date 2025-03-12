
import { createClient } from '@supabase/supabase-js';

// Development credentials that work for demo purposes
const DEMO_SUPABASE_URL = 'https://qrkfhljglzbxcfbdnrht.supabase.co';
const DEMO_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFya2ZobGpnbHpieGNmYmRucmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQxMjIxNTUsImV4cCI6MjAxOTY5ODE1NX0.r48TFyCVOhRkKNF3MF2kSu92RntGgEh50RfT3hQznmA';

// Use environment variables if available, otherwise fall back to demo credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEMO_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEMO_SUPABASE_ANON_KEY;

// Create and export the Supabase client with retryAttempts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

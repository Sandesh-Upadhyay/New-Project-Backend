
import { createClient } from '@supabase/supabase-js';

// Try to use environment variables, or fall back to a development setup that works for demo purposes
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qrkfhljglzbxcfbdnrht.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFya2ZobGpnbHpieGNmYmRucmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQxMjIxNTUsImV4cCI6MjAxOTY5ODE1NX0.r48TFyCVOhRkKNF3MF2kSu92RntGgEh50RfT3hQznmA';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

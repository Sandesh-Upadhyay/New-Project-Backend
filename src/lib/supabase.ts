
import { createClient } from '@supabase/supabase-js';

// Development credentials that work for demo purposes
const DEMO_SUPABASE_URL = 'https://qrkfhljglzbxcfbdnrht.supabase.co';
const DEMO_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFya2ZobGpnbHpieGNmYmRucmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQxMjIxNTUsImV4cCI6MjAxOTY5ODE1NX0.r48TFyCVOhRkKNF3MF2kSu92RntGgEh50RfT3hQznmA';

// Use environment variables if available, otherwise fall back to demo credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEMO_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEMO_SUPABASE_ANON_KEY;

// Maximum number of retry attempts
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // ms

// Create and export the Supabase client with improved configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: (url, options) => {
      // Implement a retry mechanism for fetch
      const fetchWithRetry = async (attempt = 0): Promise<Response> => {
        try {
          const response = await fetch(url, options);
          return response;
        } catch (err) {
          // Log the error
          console.error('Fetch error in Supabase client:', err);
          
          // If we have attempts left, retry after delay
          if (attempt < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return fetchWithRetry(attempt + 1);
          }
          
          // Out of retries, throw the error
          throw err;
        }
      };
      
      return fetchWithRetry();
    },
    headers: {
      'X-Client-Info': 'lovable-app'
    }
  },
  db: {
    schema: 'public'
  }
});

// Add a health check method to verify connectivity
export const checkSupabaseConnection = async () => {
  try {
    // Use a simpler health check that doesn't depend on a specific table
    const { data, error } = await supabase.from('health_check').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      console.error('Supabase connection check failed:', error);
      return false;
    }
    
    // If we reach here, we have connectivity
    return true;
  } catch (err) {
    console.error('Supabase connection check exception:', err);
    return false;
  }
};

// Add mock methods for offline mode
export const getMockData = {
  // Example mock method that can be used when offline
  getItems: () => {
    return {
      data: [{ id: 1, name: 'Example Item', description: 'Created in offline mode' }],
      error: null
    };
  }
};

// Function to check if network is available at all
export const isNetworkAvailable = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://www.google.com', { 
      method: 'HEAD',
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (e) {
    return false;
  }
};

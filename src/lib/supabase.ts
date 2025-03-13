
import { createClient } from '@supabase/supabase-js';

// Development credentials that work for demo purposes
const DEMO_SUPABASE_URL = 'https://qrkfhljglzbxcfbdnrht.supabase.co';
const DEMO_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFya2ZobGpnbHpieGNmYmRucmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQxMjIxNTUsImV4cCI6MjAxOTY5ODE1NX0.r48TFyCVOhRkKNF3MF2kSu92RntGgEh50RfT3hQznmA';

// Use environment variables if available, otherwise fall back to demo credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEMO_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEMO_SUPABASE_ANON_KEY;

// Maximum number of retry attempts
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

// Create and export the Supabase client with improved configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: async (url: RequestInfo | URL, options?: RequestInit) => {
      // Implement a retry mechanism for fetch
      const fetchWithRetry = async (attempt = 0): Promise<Response> => {
        try {
          console.log(`Attempt ${attempt + 1} to fetch ${typeof url === 'string' ? url : url.toString()}`);
          const response = await fetch(url, {
            ...options,
            // Reduce timeout to avoid long waits when offline
            signal: AbortSignal.timeout(10000)
          });
          return response;
        } catch (err) {
          // Log the error
          console.error(`Fetch error in Supabase client (attempt ${attempt + 1}):`, err);
          
          // If we have attempts left, retry after delay
          if (attempt < MAX_RETRIES) {
            console.log(`Retrying in ${RETRY_DELAY}ms...`);
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
      'X-Client-Info': 'lovable-app',
      'Cache-Control': 'no-store, no-cache' // Prevent caching
    }
  }
});

// Add a health check method to verify connectivity
export const checkSupabaseConnection = async () => {
  try {
    console.log("Testing Supabase connection...");
    // Use a simpler check that doesn't depend on any specific table
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase connection check failed:', error);
      return false;
    }
    
    console.log("Supabase connection successful");
    return true;
  } catch (err) {
    console.error('Supabase connection check exception:', err);
    return false;
  }
};

// Improved network availability check that works better in development
export const isNetworkAvailable = async () => {
  try {
    console.log("Checking network availability...");
    // In development, we'll consider the network available if 
    // we can connect to the Supabase API
    const isConnected = await checkSupabaseConnection();
    console.log(`Network available: ${isConnected}`);
    return isConnected;
  } catch (e) {
    console.error('Network check error:', e);
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


import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, checkSupabaseConnection, isNetworkAvailable } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  connectionStatus: 'unknown' | 'connected' | 'disconnected';
  networkAvailable: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [networkAvailable, setNetworkAvailable] = useState<boolean>(true);
  const { toast } = useToast();

  // Check network connectivity
  const checkNetworkConnectivity = async () => {
    const isAvailable = await isNetworkAvailable();
    setNetworkAvailable(isAvailable);
    
    if (!isAvailable && connectionStatus !== 'disconnected') {
      setConnectionStatus('disconnected');
      toast({
        title: 'Network unavailable',
        description: 'You appear to be offline. Some features may not work correctly.',
        variant: 'destructive',
      });
    }
    
    return isAvailable;
  };

  useEffect(() => {
    // Check network and Supabase connection on load
    const checkConnection = async () => {
      const hasNetwork = await checkNetworkConnectivity();
      
      if (hasNetwork) {
        const isConnected = await checkSupabaseConnection();
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');
        
        if (!isConnected) {
          toast({
            title: 'Connection issue',
            description: 'Unable to connect to authentication services. Please try again later.',
            variant: 'destructive',
          });
        }
      }
    };
    
    checkConnection();
    
    // Set up a periodic check for network connectivity
    const connectivityCheckInterval = setInterval(() => {
      checkNetworkConnectivity();
    }, 30000); // Check every 30 seconds
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(data.session);
          setUser(data.session?.user ?? null);
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('Auth state changed:', _event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
      clearInterval(connectivityCheckInterval);
    };
  }, [toast]);

  const signUp = async (email: string, password: string) => {
    try {
      // First check network connectivity
      const isOnline = await checkNetworkConnectivity();
      
      if (!isOnline) {
        return {
          error: { message: 'No internet connection. Please check your network settings and try again.' },
          data: null
        };
      }
      
      if (connectionStatus === 'disconnected') {
        return {
          error: { message: 'No connection to authentication service. Please try again later.' },
          data: null
        };
      }
      
      const response = await supabase.auth.signUp({
        email,
        password,
      });
      console.log('Sign up response:', response);
      return response;
    } catch (error) {
      console.error('Error during signUp:', error);
      return { 
        error: { 
          message: error instanceof Error ? error.message : 'Unknown error during sign up',
          originalError: error
        }, 
        data: null 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // First check network connectivity
      const isOnline = await checkNetworkConnectivity();
      
      if (!isOnline) {
        return {
          error: { message: 'No internet connection. Please check your network settings and try again.' },
          data: null
        };
      }
      
      if (connectionStatus === 'disconnected') {
        return {
          error: { message: 'No connection to authentication service. Please try again later.' },
          data: null
        };
      }
      
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('Sign in response:', response);
      return response;
    } catch (error) {
      console.error('Error during signIn:', error);
      return { 
        error: { 
          message: error instanceof Error ? error.message : 'Unknown error during sign in',
          originalError: error
        }, 
        data: null 
      };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during signOut:', error);
    }
  };

  const value = {
    session,
    user,
    loading,
    connectionStatus,
    networkAvailable,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

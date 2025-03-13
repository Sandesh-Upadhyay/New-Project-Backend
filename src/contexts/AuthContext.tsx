
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, checkSupabaseConnection } from '@/lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  connectionStatus: 'unknown' | 'connected' | 'disconnected';
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

  useEffect(() => {
    // Check Supabase connection on load
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    };
    
    checkConnection();
    
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

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      if (connectionStatus === 'disconnected') {
        return {
          error: { message: 'No connection to authentication service.' },
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
      if (connectionStatus === 'disconnected') {
        return {
          error: { message: 'No connection to authentication service.' },
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

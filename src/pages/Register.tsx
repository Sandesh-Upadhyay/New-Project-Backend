
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, WifiOff } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualConnectionTest, setManualConnectionTest] = useState(false);
  const [directSupabaseError, setDirectSupabaseError] = useState<string | null>(null);
  const { signUp, connectionStatus, networkAvailable } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Run a connection test when component mounts
  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test connection to Supabase directly
        const { data, error } = await supabase.auth.getSession();
        console.log("Direct Supabase connection test:", { data, error });
        
        if (error && error.message.includes('Failed to fetch')) {
          setDirectSupabaseError("Cannot connect to Supabase servers. Please check your internet connection.");
        } else {
          setDirectSupabaseError(null);
        }
      } catch (err) {
        console.error("Connection test error:", err);
        setDirectSupabaseError("Error testing connection to authentication service.");
      }
      setManualConnectionTest(true);
    };
    
    testConnection();
  }, []);

  useEffect(() => {
    // Show connection status message if there are issues
    if (connectionStatus === 'disconnected' && networkAvailable) {
      toast({
        title: 'Connection issue',
        description: 'Currently unable to connect to authentication services. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [connectionStatus, networkAvailable, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check network first
    if (!networkAvailable) {
      toast({
        title: 'No internet connection',
        description: 'Please check your network connection and try again.',
        variant: 'destructive',
      });
      return;
    }
    
    // Don't attempt if we know there's no connection
    if (connectionStatus === 'disconnected') {
      toast({
        title: 'Cannot register',
        description: 'Unable to connect to authentication services. Please try again later.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }
    
    try {
      console.log('Attempting registration with:', email);
      
      // Try direct registration with Supabase if context method fails
      try {
        const { error, data } = await signUp(email, password);
        
        if (error) {
          console.error('Registration error:', error);
          
          // If we get a network error, try direct registration
          if (error.message === 'Failed to fetch' || error.message.includes('network')) {
            throw new Error('Network error, trying direct registration');
          }
          
          const errorMessage = error.message || 'Failed to create account. Please try again.';
          
          toast({
            title: 'Registration failed',
            description: errorMessage,
            variant: 'destructive',
          });
          return;
        }
        
        if (data?.user) {
          toast({
            title: 'Registration successful',
            description: 'Please check your email to confirm your account.',
          });
          navigate('/login');
        } else {
          toast({
            title: 'Registration error',
            description: 'Failed to create account. Please try again.',
            variant: 'destructive',
          });
        }
      } catch (contextError) {
        console.log("Context auth failed, trying direct Supabase API:", contextError);
        
        // Fall back to direct Supabase API call
        const { data: directData, error: directError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (directError) {
          throw directError;
        }
        
        if (directData?.user) {
          toast({
            title: 'Registration successful',
            description: 'Please check your email to confirm your account.',
          });
          navigate('/login');
        } else {
          toast({
            title: 'Registration status unclear',
            description: 'Please check your email or try logging in.',
          });
        }
      }
    } catch (error: any) {
      console.error('Unexpected error during registration:', error);
      const errorMessage = error.message?.includes('fetch') || error.message?.includes('network')
        ? 'Network error. Please check your connection and try again.'
        : error.message || 'An unexpected error occurred. Please try again.';
        
      toast({
        title: 'Registration failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const showConnectionIssue = !networkAvailable || connectionStatus === 'disconnected' || directSupabaseError;

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Register</CardTitle>
          <CardDescription>
            Create a new account to manage your items
          </CardDescription>
          
          {!networkAvailable && (
            <Alert variant="destructive" className="mt-4">
              <WifiOff className="h-4 w-4" />
              <AlertTitle>No Internet Connection</AlertTitle>
              <AlertDescription>
                You appear to be offline. Please check your network connection.
              </AlertDescription>
            </Alert>
          )}
          
          {connectionStatus === 'disconnected' && networkAvailable && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>
                Unable to connect to authentication services. Please try again later.
              </AlertDescription>
            </Alert>
          )}
          
          {directSupabaseError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Supabase Connection Error</AlertTitle>
              <AlertDescription>{directSupabaseError}</AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="youremail@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                Password must be at least 6 characters long
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || showConnectionIssue}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:underline">
                Login
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, WifiOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, connectionStatus, networkAvailable } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
        title: 'Cannot login',
        description: 'Unable to connect to authentication services. Please try again later.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Attempting to sign in with:', email);
      const { error, data } = await signIn(email, password);
      
      if (error) {
        console.error('Login error:', error);
        const errorMessage = error.message === 'Failed to fetch' 
          ? 'Connection error. Please check your internet connection and try again.'
          : error.message || 'Invalid email or password. Please try again.';
          
        toast({
          title: 'Login failed',
          description: errorMessage,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      console.log('Login successful:', data);
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Unexpected error during login:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      // Check if it's a network error
      if (error.message && error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection or try again later.';
      }
      
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Sign in to your account to manage your items
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
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || connectionStatus === 'disconnected' || !networkAvailable}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="text-center text-sm">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-600 hover:underline">
                Register
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;

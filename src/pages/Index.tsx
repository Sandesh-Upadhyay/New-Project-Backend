
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-900">Item Manager</h1>
          <div className="space-x-2">
            {user ? (
              <Button onClick={() => navigate('/dashboard')}>Dashboard</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate('/login')}>Login</Button>
                <Button onClick={() => navigate('/register')}>Register</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-blue-900 sm:text-5xl">
            Manage Your Items with Ease
          </h2>
          <p className="mb-8 text-xl text-gray-600">
            A complete application with authentication, database integration, and CRUD operations.
          </p>
          <div className="flex justify-center space-x-4">
            {user ? (
              <Button size="lg" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            ) : (
              <Button size="lg" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            )}
          </div>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-xl font-bold text-blue-900">User Authentication</h3>
            <p className="text-gray-600">
              Secure user authentication with email and password sign up and sign in functionality.
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-xl font-bold text-blue-900">Database Integration</h3>
            <p className="text-gray-600">
              Fully integrated with Supabase for reliable and scalable data storage.
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-xl font-bold text-blue-900">CRUD Operations</h3>
            <p className="text-gray-600">
              Complete Create, Read, Update, and Delete functionality with proper authorization.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

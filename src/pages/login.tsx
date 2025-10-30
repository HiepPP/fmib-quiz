import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Container } from '@/components/ui/Container';
import { useAuth } from '@/hooks/useAuth';

const LoginPage: NextPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, isAuthenticated, clearError } = useAuth();

  // Check if user is already logged in and redirect
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous errors
    clearError();

    try {
      console.log('Attempting login with SWR:', { username, password: '***' });

      const success = await login({ username, password });

      if (success) {
        console.log('Login successful, redirecting to admin...');
        // The redirect will happen automatically via the useEffect hook
        // when isAuthenticated state updates
      } else {
        console.log('Login failed - invalid credentials');
      }
    } catch (err: any) {
      console.error('SWR login error:', err);
      // Error is handled by the useAuth hook, no need to set it manually
    }
  };

  return (
    <Container className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Admin Login"
            description="Enter your credentials to access the admin panel"
          />
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="error">
                  {error.data?.error || error.message || 'An error occurred. Please try again.'}
                </Alert>
              )}

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                loading={isLoading}
                fullWidth
                size="lg"
                disabled={!username || !password}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Demo credentials: admin / admin
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
};

export default LoginPage;
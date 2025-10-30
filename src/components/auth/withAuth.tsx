import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated, clearAuth } from '@/lib/storage';
import type { NextPage } from 'next';

interface WithAuthProps {
  // Add any additional props you want to pass to the wrapped component
}

const withAuth = <P extends object>(
  WrappedComponent: NextPage<P>
): NextPage<P & WithAuthProps> => {
  const AuthenticatedComponent: NextPage<P & WithAuthProps> = (props) => {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);

    useEffect(() => {
      const checkAuth = () => {
        try {
          console.log('🔍 Checking authentication status...');
          const authStatus = isAuthenticated();
          console.log('🔐 Authentication status:', authStatus);

          if (!authStatus) {
            console.log('❌ Not authenticated, redirecting to login...');
            // Not authenticated, redirect to login
            clearAuth(); // Clean up any invalid auth data
            router.push('/login');
            return;
          }

          console.log('✅ Authentication confirmed, setting user as authenticated');
          setIsAuthenticatedUser(true);
        } catch (error) {
          console.error('❌ Auth check error:', error);
          clearAuth();
          router.push('/login');
        } finally {
          setIsChecking(false);
        }
      };

      checkAuth();
    }, [router]);

    // Show loading state while checking authentication
    if (isChecking) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Checking authentication...</p>
          </div>
        </div>
      );
    }

    // Show loading or redirect if not authenticated
    if (!isAuthenticatedUser) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting to login...</p>
          </div>
        </div>
      );
    }

    // User is authenticated, render the wrapped component
    return <WrappedComponent {...(props as P)} />;
  };

  // Set display name for debugging
  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AuthenticatedComponent;
};

export default withAuth;
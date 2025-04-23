
import React from 'react';
import { Link } from 'react-router-dom';
import { UserRole } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Lock } from 'lucide-react';

const UnauthorizedPage: React.FC = () => {
  const { isAuthenticated, userRoles } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <Lock className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
            <div>
              <p className="text-sm text-yellow-700">
                {isAuthenticated
                  ? 'Your current account does not have the required permissions.'
                  : 'Please log in to access this page.'}
              </p>
              {isAuthenticated && (
                <p className="text-xs text-yellow-600 mt-1">
                  Current role(s): {userRoles.length ? userRoles.join(', ') : 'No roles assigned'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <Button asChild className="w-full">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go to Homepage
            </Link>
          </Button>

          {!isAuthenticated && (
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Log In</Link>
            </Button>
          )}

          {isAuthenticated && !userRoles.includes(UserRole.Admin) && (
            <div className="text-center text-sm text-gray-500 mt-4">
              <p>
                Need admin access?{' '}
                <a href="mailto:support@example.com" className="text-primary hover:underline">
                  Request access
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

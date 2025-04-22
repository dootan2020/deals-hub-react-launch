
import { memo, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/types/auth.types';
import { EmailVerificationGate } from './EmailVerificationGate';
import { RoleChecker } from './roles/RoleChecker';
import { useRenderCount } from '@/hooks/useRenderCount';

// Memoized loading screen component
const AuthLoadingScreen = memo(() => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
));

AuthLoadingScreen.displayName = 'AuthLoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export const ProtectedRoute = memo(({ 
  children, 
  requiredRoles = [] 
}: ProtectedRouteProps) => {
  const renderCount = useRenderCount('ProtectedRoute');
  const location = useLocation();
  
  const { 
    user, 
    loading: authLoading, 
    session,
    isAuthenticated
  } = useAuth();

  // Memoize route protection checks
  const authChecks = useMemo(() => {
    const isFullyAuthenticated = user && 
      isAuthenticated && 
      session?.access_token && 
      (session.expires_at ? session.expires_at * 1000 > Date.now() : true);

    return {
      isFullyAuthenticated,
      needsRedirect: !isAuthenticated || !user
    };
  }, [user, isAuthenticated, session]);

  // Memoize the navigation component
  const loginRedirect = useMemo(() => (
    <Navigate 
      to="/login" 
      state={{ from: location }} 
      replace 
    />
  ), [location]);

  // Memoize the protected content
  const protectedContent = useMemo(() => (
    <RoleChecker
      userRoles={user?.roles || []}
      requiredRoles={requiredRoles}
      roleCheckComplete={true}
    >
      <EmailVerificationGate>
        {children}
      </EmailVerificationGate>
    </RoleChecker>
  ), [user?.roles, requiredRoles, children]);

  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  if (authChecks.needsRedirect) {
    return loginRedirect;
  }

  if (authChecks.isFullyAuthenticated) {
    return protectedContent;
  }

  return loginRedirect;
});

ProtectedRoute.displayName = 'ProtectedRoute';

export default ProtectedRoute;

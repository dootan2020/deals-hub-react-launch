
import { memo, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/types/auth.types';
import { EmailVerificationGate } from './EmailVerificationGate';
import { RoleChecker } from './roles/RoleChecker';
import { useRenderCount } from '@/hooks/useRenderCount';
import { withRenderCount } from '@/components/debug/withRenderCount'; // Thêm import này

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
  const metrics = useRenderCount('ProtectedRoute');
  const location = useLocation();
  
  const { 
    user, 
    loading: authLoading, 
    session,
    isAuthenticated
  } = useAuth();

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

  const loginRedirect = useMemo(() => (
    <Navigate 
      to="/login" 
      state={{ from: location }} 
      replace 
    />
  ), [location]);

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

  useEffect(() => {
    if (!authLoading) {
      const navigationStart = performance.now();
      performance.mark('protected-route-start');
      
      return () => {
        performance.mark('protected-route-end');
        performance.measure(
          'protected-route-navigation',
          'protected-route-start',
          'protected-route-end'
        );
        
        const navigationTime = performance.now() - navigationStart;
        console.log(
          `%c[Navigation] Protected Route:`,
          'color: #3498DB',
          `Time: ${navigationTime.toFixed(2)}ms`
        );
      };
    }
  }, [location.pathname, authLoading]);

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

export default withRenderCount(ProtectedRoute, 'ProtectedRoute');


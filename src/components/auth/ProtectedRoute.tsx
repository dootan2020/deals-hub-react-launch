import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/types/auth.types';
import AuthLoadingScreen from './loading/AuthLoadingScreen';
import { EmailVerificationGate } from "./EmailVerificationGate";
import { useAuthRefresh } from '@/hooks/auth/use-auth-refresh';
import { RoleChecker } from './roles/RoleChecker';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, requiredRoles = [] }: ProtectedRouteProps) => {
  const { isAuthenticated, loading: authLoading, userRoles, user, session } = useAuth();
  const location = useLocation();
  const [authTimeout, setAuthTimeout] = useState(false);
  const [waitingTooLong, setWaitingTooLong] = useState(false);
  const [roleCheckComplete, setRoleCheckComplete] = useState(requiredRoles.length === 0);

  const {
    refreshing,
    attempts,
    showRetry,
    attemptRefresh,
    handleRetry
  } = useAuthRefresh();

  useEffect(() => {
    if (requiredRoles.length > 0 && userRoles.length > 0) {
      setRoleCheckComplete(true);
    }
  }, [requiredRoles, userRoles]);

  useEffect(() => {
    if (!authLoading) return;
    
    const timeoutId = setTimeout(() => {
      if (authLoading && !isAuthenticated) {
        console.log('Authentication verification taking longer than expected');
        console.debug('Auth state debug:', {
          authLoading,
          isAuthenticated,
          hasUser: !!user,
          hasSession: !!session,
          refreshing,
          attempts,
        });
        setWaitingTooLong(true);
      }
    }, 5000);

    const hardTimeoutId = setTimeout(() => {
      if (authLoading && !isAuthenticated) {
        console.error('Authentication timeout reached');
        console.debug('Auth state on timeout:', {
          authLoading,
          isAuthenticated,
          hasUser: !!user,
          hasSession: !!session,
          refreshing,
          attempts,
        });
        setAuthTimeout(true);
      }
    }, 20000);
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(hardTimeoutId);
    };
  }, [authLoading, isAuthenticated, user, session, refreshing, attempts]);

  if (user && isAuthenticated) {
    console.debug('ProtectedRoute: User authenticated, rendering content');
    return (
      <RoleChecker
        userRoles={userRoles}
        requiredRoles={requiredRoles}
        roleCheckComplete={roleCheckComplete}
      >
        <EmailVerificationGate>
          {children}
        </EmailVerificationGate>
      </RoleChecker>
    );
  }

  if (authTimeout) {
    console.debug('ProtectedRoute: Auth timeout reached, redirecting to login');
    return <Navigate to="/login" state={{ from: location, authError: 'timeout' }} replace />;
  }

  if ((authLoading || refreshing) && !user) {
    console.debug('ProtectedRoute: Still loading or refreshing without user, showing loading screen');
    return (
      <AuthLoadingScreen 
        onRetry={showRetry ? handleRetry : undefined}
        message={refreshing ? "Đang khôi phục phiên đăng nhập..." : "Đang xác minh phiên đăng nhập..."}
        attempts={attempts}
        isWaitingTooLong={waitingTooLong}
      />
    );
  }

  if (!isAuthenticated || !user) {
    console.log('User not authenticated - redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.debug('ProtectedRoute: Fallback render path (should not be reached)');
  return (
    <RoleChecker
      userRoles={userRoles}
      requiredRoles={requiredRoles}
      roleCheckComplete={roleCheckComplete}
    >
      <EmailVerificationGate>
        {children}
      </EmailVerificationGate>
    </RoleChecker>
  );
};

export default ProtectedRoute;


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
    // Don't start timeout if we already have a valid user/session
    if (user && isAuthenticated) return;
    
    // Only start timeouts if we're actually loading
    if (!authLoading && !refreshing) return;
    
    console.debug('ProtectedRoute: Setting up auth timeouts', { 
      authLoading, 
      refreshing,
      hasUser: !!user, 
      isAuthenticated 
    });
    
    const timeoutId = setTimeout(() => {
      if ((authLoading || refreshing) && !isAuthenticated) {
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
      if ((authLoading || refreshing) && !isAuthenticated) {
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

  // Debug logging to trace authentication state changes
  useEffect(() => {
    console.debug('ProtectedRoute state update:', {
      isAuthenticated,
      hasUser: !!user,
      hasSession: !!session,
      authLoading,
      refreshing,
      attempts
    });
  }, [isAuthenticated, user, session, authLoading, refreshing, attempts]);

  // CRITICAL: If we have a valid user and isAuthenticated, render content immediately
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

  // Only timeout after our hard limit
  if (authTimeout) {
    console.debug('ProtectedRoute: Auth timeout reached, redirecting to login');
    return <Navigate to="/login" state={{ from: location, authError: 'timeout' }} replace />;
  }

  // Show loading screen during authentication or refresh attempts
  if ((authLoading || refreshing) && !authTimeout) {
    console.debug('ProtectedRoute: Still loading or refreshing, showing loading screen');
    return (
      <AuthLoadingScreen 
        onRetry={showRetry ? handleRetry : undefined}
        message={refreshing ? "Đang khôi phục phiên đăng nhập..." : "Đang xác minh phiên đăng nhập..."}
        attempts={attempts}
        isWaitingTooLong={waitingTooLong}
      />
    );
  }

  // If authentication failed and we're not loading, redirect to login
  if (!isAuthenticated || !user) {
    console.log('User not authenticated - redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Fallback (should not reach here, but just in case)
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

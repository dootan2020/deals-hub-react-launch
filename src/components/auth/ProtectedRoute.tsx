
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/types/auth.types';
import AuthLoadingScreen from './AuthLoadingScreen';
import { EmailVerificationGate } from "./EmailVerificationGate";
import { useAuthRefresh } from '@/hooks/auth/use-auth-refresh';
import { RoleChecker } from './RoleChecker';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, requiredRoles = [] }: ProtectedRouteProps) => {
  const { isAuthenticated, loading: authLoading, userRoles, user, session } = useAuth();
  const location = useLocation();
  const [authTimeout, setAuthTimeout] = useState(false);
  const [sessionInvalid, setSessionInvalid] = useState(false);
  const [roleCheckComplete, setRoleCheckComplete] = useState(requiredRoles.length === 0);
  const [waitingTooLong, setWaitingTooLong] = useState(false);
  
  const {
    refreshing,
    attempts,
    showRetry,
    attemptRefresh,
    handleRetry
  } = useAuthRefresh();

  // Check if session needs refresh
  useEffect(() => {
    if (authLoading) return;
    
    const checkAndRefreshSession = async () => {
      if (!isAuthenticated && !refreshing) {
        console.log('Session not detected, attempting refresh...');
        await attemptRefresh();
      }
    };
    
    checkAndRefreshSession();
  }, [authLoading, isAuthenticated, refreshing, attemptRefresh]);

  // Handle timeouts - shorter timeout for better UX
  useEffect(() => {
    if (!authLoading) return;
    
    const timeoutId = setTimeout(() => {
      if (authLoading && !isAuthenticated) {
        console.log('Authentication verification taking longer than expected');
        setWaitingTooLong(true);
      }
    }, 3000); // Show additional message after 3 seconds

    const hardTimeoutId = setTimeout(() => {
      if (authLoading && !isAuthenticated) {
        console.error('Authentication timeout reached');
        setAuthTimeout(true);
      }
    }, 8000); // Hard timeout after 8 seconds

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(hardTimeoutId);
    };
  }, [authLoading, isAuthenticated]);

  // Check roles when available
  useEffect(() => {
    if (requiredRoles.length > 0 && userRoles.length > 0) {
      setRoleCheckComplete(true);
    }
  }, [requiredRoles, userRoles]);

  // Handle session expiration
  useEffect(() => {
    if (user && session?.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at < now) {
        console.log("Session expired at:", new Date(session.expires_at * 1000).toLocaleString());
        setSessionInvalid(true);
      }
    }
  }, [user, session]);

  if (sessionInvalid) {
    return <Navigate to="/login" state={{ from: location, authError: 'expired' }} replace />;
  }

  if (authTimeout) {
    return <Navigate to="/login" state={{ from: location, authError: 'timeout' }} replace />;
  }

  // Show loading screen with appropriate messaging
  if (authLoading || refreshing) {
    return (
      <AuthLoadingScreen 
        onRetry={showRetry ? handleRetry : undefined}
        onCancel={() => null}
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

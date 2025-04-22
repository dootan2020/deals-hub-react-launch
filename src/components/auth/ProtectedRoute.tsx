
import { useEffect, useState, useCallback, useRef } from 'react';
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
  
  // Track mount state to prevent updates after unmount
  const isMounted = useRef(true);
  const timeoutIds = useRef<NodeJS.Timeout[]>([]);

  const {
    refreshing,
    attempts,
    showRetry,
    attemptRefresh,
    handleRetry
  } = useAuthRefresh();

  // Set up role check completion
  useEffect(() => {
    if (requiredRoles.length > 0 && userRoles.length > 0) {
      setRoleCheckComplete(true);
    }
  }, [requiredRoles, userRoles]);

  // Clear all timeouts on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      timeoutIds.current.forEach(clearTimeout);
      timeoutIds.current = [];
    };
  }, []);

  // Set up authentication timeouts with debouncing
  useEffect(() => {
    // Skip if already authenticated or not loading
    if (user && isAuthenticated) return;
    if (!authLoading && !refreshing) return;

    const addTimeout = (callback: () => void, delay: number) => {
      const timeoutId = setTimeout(() => {
        if (isMounted.current) {
          callback();
        }
      }, delay);
      timeoutIds.current.push(timeoutId);
      return timeoutId;
    };

    // Warning timeout (5s)
    addTimeout(() => {
      if ((authLoading || refreshing) && !isAuthenticated) {
        setWaitingTooLong(true);
      }
    }, 5000);

    // Hard timeout (15s - reduced from 20s)
    addTimeout(() => {
      if ((authLoading || refreshing) && !isAuthenticated) {
        setAuthTimeout(true);
      }
    }, 15000);

    return () => {
      timeoutIds.current.forEach(clearTimeout);
      timeoutIds.current = [];
    };
  }, [authLoading, isAuthenticated, user, session, refreshing, attempts]);

  // CRITICAL: Authenticated user check with proper validation
  const isFullyAuthenticated = user && 
    isAuthenticated && 
    session?.access_token && 
    session.expires_at * 1000 > Date.now();

  // Return authenticated content immediately if possible
  if (isFullyAuthenticated) {
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

  // Handle timeout
  if (authTimeout) {
    return <Navigate to="/login" state={{ from: location, authError: 'timeout' }} replace />;
  }

  // Show loading screen during authentication or refresh
  if ((authLoading || refreshing) && !authTimeout) {
    return (
      <AuthLoadingScreen 
        onRetry={showRetry ? handleRetry : undefined}
        message={refreshing ? "Đang khôi phục phiên đăng nhập..." : "Đang xác minh phiên đăng nhập..."}
        attempts={attempts}
        isWaitingTooLong={waitingTooLong}
      />
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Fallback render with role and email verification checks
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

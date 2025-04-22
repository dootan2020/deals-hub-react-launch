
import { useEffect, useState, useRef } from 'react';
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
  const { 
    isAuthenticated, 
    loading: authLoading, 
    userRoles, 
    user, 
    session,
    refreshSession
  } = useAuth();
  const location = useLocation();
  const [authTimeout, setAuthTimeout] = useState(false);
  const [waitingTooLong, setWaitingTooLong] = useState(false);
  const [roleCheckComplete, setRoleCheckComplete] = useState(requiredRoles.length === 0);
  
  // Track mount state to prevent updates after unmount
  const isMounted = useRef(true);
  const timeoutIds = useRef<NodeJS.Timeout[]>([]);
  const refreshAttempted = useRef(false);

  const {
    refreshing,
    attempts,
    showRetry,
    attemptRefresh,
    handleRetry,
    cleanup: cleanupRefreshAttempts
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
      cleanupRefreshAttempts();
    };
  }, [cleanupRefreshAttempts]);

  // Handle session refresh if needed - with safeguards against infinite loops
  useEffect(() => {
    // If authenticated, already loading or refresh already attempted, skip
    if (isAuthenticated || authLoading || refreshAttempted.current) return;
    
    // Set the flag to prevent multiple attempts in the same render cycle
    refreshAttempted.current = true;
    
    // Check if session might be valid but not detected
    const attemptSessionRestore = async () => {
      try {
        console.log("Attempting session restore...");
        const success = await refreshSession();
        
        // If refresh failed and component still mounted, try the refresh mechanism
        if (!success && !authLoading && isMounted.current) {
          attemptRefresh();
        }
      } catch (error) {
        console.error("Error attempting session restore:", error);
      }
    };
    
    // Wait a small delay before attempting to avoid immediate attempts during navigation
    const delayTimer = setTimeout(() => {
      attemptSessionRestore();
    }, 50);
    
    timeoutIds.current.push(delayTimer);
    
    return () => {
      clearTimeout(delayTimer);
    };
  }, [isAuthenticated, authLoading, refreshSession, attemptRefresh]);

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

    // Hard timeout (8s instead of 10s to avoid race conditions)
    addTimeout(() => {
      if ((authLoading || refreshing) && !isAuthenticated) {
        setAuthTimeout(true);
      }
    }, 8000);

    return () => {
      timeoutIds.current.forEach(clearTimeout);
      timeoutIds.current = [];
    };
  }, [authLoading, isAuthenticated, user, session, refreshing, attempts]);

  // CRITICAL: Authenticated user check with proper validation
  const isFullyAuthenticated = user && 
    isAuthenticated && 
    session?.access_token && 
    (session.expires_at ? session.expires_at * 1000 > Date.now() : true);

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

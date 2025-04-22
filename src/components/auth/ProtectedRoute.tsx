
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/types/auth.types';
import AuthLoadingScreen from './AuthLoadingScreen';
import { EmailVerificationGate } from "./EmailVerificationGate";
import { useAuthRefresh } from '@/hooks/auth/use-auth-refresh';
import { RoleChecker } from './RoleChecker';
import { toast } from 'sonner';

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
  const [loadStartTime] = useState(Date.now());
  const [forceRender, setForceRender] = useState(false);
  
  const {
    refreshing,
    attempts,
    showRetry,
    attemptRefresh,
    handleRetry
  } = useAuthRefresh();

  // Log detailed debug information when first rendered
  useEffect(() => {
    console.log(`ProtectedRoute mounted at ${new Date().toISOString()}`, {
      path: location.pathname,
      isAuthenticated,
      authLoading,
      refreshing,
      hasSession: !!session,
      hasUser: !!user
    });
  }, []);

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

  // Reset timeout if authenticated
  useEffect(() => {
    if (isAuthenticated && authTimeout) {
      console.log('Authentication successful, resetting timeout state');
      setAuthTimeout(false);
    }
  }, [isAuthenticated, authTimeout]);

  // Handle timeouts with improved logging
  useEffect(() => {
    if (!authLoading) return;
    
    console.log(`Auth loading state active for ${location.pathname}, setting timeouts`);
    
    const timeoutId = setTimeout(() => {
      if (authLoading && !isAuthenticated) {
        console.log('Authentication verification taking longer than expected');
        setWaitingTooLong(true);
      }
    }, 5000); // 5 seconds

    const hardTimeoutId = setTimeout(() => {
      if (authLoading && !isAuthenticated) {
        console.error('Authentication timeout reached');
        setAuthTimeout(true);
        
        // Show error toast
        toast.error('Quá thời gian xác thực', {
          description: 'Không thể xác minh phiên đăng nhập, vui lòng thử đăng nhập lại',
        });
      }
    }, 15000); // 15 seconds
    
    // Hard fallback to force update UI in case we're stuck in a dead state
    const uiFallbackId = setTimeout(() => {
      const elapsedTime = Math.floor((Date.now() - loadStartTime) / 1000);
      if (authLoading && elapsedTime > 20) {
        console.warn(`Protected route has been loading for ${elapsedTime}s, attempting UI force update`);
        setForceRender(prev => !prev); // Toggle to force a re-render
      }
    }, 20000); // 20 seconds

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(hardTimeoutId);
      clearTimeout(uiFallbackId);
    };
  }, [authLoading, isAuthenticated, loadStartTime, location.pathname]);

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
        
        // Show expiration toast
        toast.warning('Phiên đăng nhập đã hết hạn', {
          description: 'Vui lòng đăng nhập lại để tiếp tục',
        });
      } else {
        // Session is valid, ensure sessionInvalid is false
        setSessionInvalid(false);
      }
    }
  }, [user, session]);

  // Logging for state changes
  useEffect(() => {
    const elapsedTime = Math.floor((Date.now() - loadStartTime) / 1000);
    if (elapsedTime > 10 && authLoading) {
      console.warn(`ProtectedRoute at ${location.pathname} still loading after ${elapsedTime}s`, {
        isAuthenticated,
        refreshing,
        attempts,
        waitingTooLong
      });
    }
  }, [authLoading, isAuthenticated, refreshing, attempts, waitingTooLong, loadStartTime, location.pathname]);

  // This is a failsafe. If somehow we have user and session but still in loading state
  useEffect(() => {
    if (authLoading && user && session && isAuthenticated) {
      const elapsedTime = Math.floor((Date.now() - loadStartTime) / 1000);
      if (elapsedTime > 8) { // If we've been stuck for over 8 seconds
        console.warn("Loading state stuck despite having user and session, forcing render");
        // Force proceeding with the render despite loading state
        setForceRender(true);
      }
    }
  }, [authLoading, user, session, isAuthenticated, loadStartTime]);

  if (sessionInvalid) {
    return <Navigate to="/login" state={{ from: location, authError: 'expired' }} replace />;
  }

  if (authTimeout) {
    return <Navigate to="/login" state={{ from: location, authError: 'timeout' }} replace />;
  }

  // Safe fallback - if we have auth credentials but still loading, proceed after sufficient wait
  const shouldBypassLoading = forceRender && user && session && isAuthenticated;

  // Show loading screen with appropriate messaging
  if ((authLoading || refreshing) && !shouldBypassLoading) {
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

  // If we got here, the user is authenticated and loading is done
  console.log(`ProtectedRoute rendering children for ${location.pathname}`);
  
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

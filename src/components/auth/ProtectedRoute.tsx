
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/auth.types';
import AuthLoadingScreen from './AuthLoadingScreen';
import { toast } from '@/hooks/use-toast';
import { EmailVerificationGate } from "./EmailVerificationGate";
import { supabase, reloadSession } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, requiredRoles = [] }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, userRoles, user, logout, session, refreshUserProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [authTimeout, setAuthTimeout] = useState(false);
  const [sessionInvalid, setSessionInvalid] = useState(false);
  const [roleCheckComplete, setRoleCheckComplete] = useState(requiredRoles.length === 0);
  const [refreshingSession, setRefreshingSession] = useState(false);
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  const [showRetryButton, setShowRetryButton] = useState(false);

  // More robust session refresh logic with multiple attempts
  const attemptSessionRefresh = useCallback(async () => {
    if (refreshingSession || (refreshAttempts >= 3 && refreshAttempted)) return false;
    
    console.log(`Attempting to refresh session (attempt ${refreshAttempts + 1}/3)...`);
    setRefreshingSession(true);
    
    try {
      const { success, data, error } = await reloadSession();
      
      if (success && data?.session) {
        console.log("Session refreshed successfully");
        setRefreshAttempted(true);
        return true;
      } else {
        console.error("Session refresh failed:", error?.message || "Unknown error");
        setRefreshAttempts(prev => prev + 1);
        
        if (refreshAttempts >= 2) {
          setShowRetryButton(true);
          setSessionInvalid(true);
        }
        return false;
      }
    } catch (error) {
      console.error("Error during session refresh:", error);
      setRefreshAttempts(prev => prev + 1);
      
      if (refreshAttempts >= 2) {
        setShowRetryButton(true);
        setSessionInvalid(true);
      }
      return false;
    } finally {
      setRefreshingSession(false);
      setRefreshAttempted(true);
    }
  }, [refreshingSession, refreshAttempts, refreshAttempted]);

  // Check if session needs refresh
  useEffect(() => {
    if (loading) return;
    
    const checkAndRefreshSession = async () => {
      // Only try to refresh if we're not authenticated
      if (!isAuthenticated && !refreshingSession && refreshAttempts < 3) {
        await attemptSessionRefresh();
      }
    };
    
    checkAndRefreshSession();
  }, [loading, isAuthenticated, refreshingSession, refreshAttempts, attemptSessionRefresh]);

  // Auth timeout handling with progressive feedback
  useEffect(() => {
    if (!loading) return;
    
    // First quick timeout to show retry button
    const quickTimeoutId = setTimeout(() => {
      if (loading && !isAuthenticated) {
        setShowRetryButton(true);
      }
    }, 3000); // 3 seconds
    
    // Real timeout for authentication (10 seconds)
    const timeoutId = setTimeout(() => {
      if (loading && !isAuthenticated) {
        console.error('Authentication timeout reached. Will redirect to login.');
        setAuthTimeout(true);
        toast.warning('Xác thực phiên truy cập thất bại', 'Đang chuyển hướng đến trang đăng nhập...');
      }
    }, 8000); // 8 seconds instead of 12 to reduce waiting time

    return () => {
      clearTimeout(quickTimeoutId);
      clearTimeout(timeoutId);
    };
  }, [loading, isAuthenticated]);

  // Handle role checking
  useEffect(() => {
    if (requiredRoles.length > 0 && userRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      setRoleCheckComplete(true);
    }
  }, [requiredRoles, userRoles]);

  // Handle session expiration
  useEffect(() => {
    if (user && session && session.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at < now) {
        console.log("Session expired at:", new Date(session.expires_at * 1000).toLocaleString());
        console.log("Current time:", new Date().toLocaleString());
        setSessionInvalid(true);
      }
    }
  }, [user, session]);

  // Handle manual retry
  const handleRetry = async () => {
    setShowRetryButton(false);
    setAuthTimeout(false);
    setSessionInvalid(false);
    setRefreshAttempts(0);
    setRefreshAttempted(false);
    
    const success = await attemptSessionRefresh();
    if (!success && !isAuthenticated) {
      toast({
        title: "Không thể khôi phục phiên",
        description: "Vui lòng đăng nhập lại để tiếp tục",
        variant: "destructive"
      });
      navigate('/login', { 
        replace: true, 
        state: { 
          from: location.pathname, 
          authError: 'session_restore_failed' 
        } 
      });
    }
  };

  // Handle invalid session logout and redirect
  useEffect(() => {
    if (sessionInvalid && logout) {
      const performLogout = async () => {
        try {
          await logout();
          toast({
            title: "Phiên đăng nhập hết hạn",
            description: "Vui lòng đăng nhập lại để tiếp tục",
            variant: "destructive"
          });
          navigate('/login', { 
            replace: true, 
            state: { 
              from: location.pathname, 
              authError: 'expired' 
            } 
          });
        } catch (error) {
          console.error("Error during logout:", error);
          // Ensure redirect happens even if logout fails
          navigate('/login', { replace: true });
        }
      };
      
      performLogout();
      return null; // Return null while logout is in progress
    }
    return undefined;
  }, [sessionInvalid, logout, navigate, location]);

  if (authTimeout) {
    return <Navigate to="/login" state={{ from: location, authError: 'timeout' }} replace />;
  }

  if (sessionInvalid) {
    return null; // Return null while logout and redirect are processing
  }

  if (loading || refreshingSession) {
    return (
      <AuthLoadingScreen 
        onRetry={showRetryButton ? handleRetry : undefined}
        onCancel={() => navigate('/')}
        message={refreshingSession ? "Đang khôi phục phiên đăng nhập..." : "Đang xác minh phiên đăng nhập..."}
        attempts={refreshAttempts}
      />
    );
  }

  if (!isAuthenticated || !user) {
    console.log('User not authenticated - redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wait for role check if required
  if (requiredRoles.length > 0 && !roleCheckComplete && userRoles.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Check if user has required role
  const hasRequiredRole = requiredRoles.length === 0 || 
                         requiredRoles.some(role => userRoles.includes(role));

  if (!hasRequiredRole) {
    console.log('User lacks required role - redirecting to unauthorized');
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // If all checks pass, render children wrapped in email verification gate
  return (
    <EmailVerificationGate>
      {children}
    </EmailVerificationGate>
  );
};

export default ProtectedRoute;

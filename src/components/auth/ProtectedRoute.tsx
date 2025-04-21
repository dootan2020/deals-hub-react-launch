
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/auth.types';
import AuthLoadingScreen from './AuthLoadingScreen';
import { toast } from '@/hooks/use-toast';
import { EmailVerificationGate } from "./EmailVerificationGate";
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, requiredRoles = [] }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, userRoles, user, logout, session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [authTimeout, setAuthTimeout] = useState(false);
  const [sessionInvalid, setSessionInvalid] = useState(false);
  const [roleCheckComplete, setRoleCheckComplete] = useState(requiredRoles.length === 0);
  const [refreshingSession, setRefreshingSession] = useState(false);
  const [refreshAttempted, setRefreshAttempted] = useState(false);

  // Check if session needs refresh
  useEffect(() => {
    const checkAndRefreshSession = async () => {
      if (loading || !session || isAuthenticated || refreshingSession || refreshAttempted) return;
      
      // If we have no session but the page requires authentication, try refreshing
      try {
        console.log("Attempting to refresh session...");
        setRefreshingSession(true);
        
        // Force session refresh using refresh token
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error("Session refresh failed:", error.message);
          setSessionInvalid(true);
        } else if (data.session) {
          console.log("Session refreshed successfully");
          // Auth context will be updated via onAuthStateChange event
        } else {
          console.log("No session available after refresh attempt");
          setSessionInvalid(true);
        }
      } catch (error) {
        console.error("Error during session refresh:", error);
        setSessionInvalid(true);
      } finally {
        setRefreshingSession(false);
        setRefreshAttempted(true);
      }
    };
    
    checkAndRefreshSession();
  }, [loading, session, isAuthenticated, refreshingSession, refreshAttempted]);

  // Auth timeout handling
  useEffect(() => {
    if (!loading) return;
    
    // Set a reasonable timeout for authentication (10 seconds)
    const timeoutId = setTimeout(() => {
      console.error('Authentication timeout reached. Will redirect to login.');
      setAuthTimeout(true);
    }, 10000); // 10 seconds

    return () => clearTimeout(timeoutId);
  }, [loading]);

  // Handle role checking
  useEffect(() => {
    if (requiredRoles.length > 0 && userRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      setRoleCheckComplete(true);
    }
  }, [requiredRoles, userRoles]);

  // Handle auth timeout toasts
  useEffect(() => {
    if (authTimeout) {
      console.log('Authentication timeout triggered - redirecting to login');
      toast({
        title: "Phiên đăng nhập hết hạn",
        description: "Vui lòng đăng nhập lại",
        variant: "destructive"
      });
    }
  }, [authTimeout]);

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
        onRetry={() => window.location.reload()}
        onCancel={() => navigate('/')}
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

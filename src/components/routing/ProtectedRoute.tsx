
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/auth.types';
import AuthLoadingScreen from '@/components/auth/AuthLoadingScreen';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasTriedRefresh, setHasTriedRefresh] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('ProtectedRoute - Path:', location.pathname);
    console.log('ProtectedRoute - Auth state:', { 
      isAuthenticated, 
      loading, 
      user, 
      userRoles,
      session: session ? {
        expires_at: new Date(session.expires_at * 1000).toLocaleString(),
        token: session.access_token.substring(0, 15) + '...'
      } : 'No session'
    });
    console.log('ProtectedRoute - Required roles:', requiredRoles);
  }, [location.pathname, isAuthenticated, loading, user, userRoles, requiredRoles, session]);

  // Create an optimized refresh function
  const refreshAuth = useCallback(async () => {
    if (!user?.id || isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      console.log("ProtectedRoute - Refreshing auth data");
      
      // First try to refresh the session if needed
      if (session?.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        // If token expires in less than 5 minutes, refresh it
        if (session.expires_at - now < 300) {
          console.log("Token expiring soon, refreshing session");
          const { data, error } = await supabase.auth.refreshSession();
          if (error) {
            console.error("Session refresh failed:", error);
            throw error;
          } else {
            console.log("Session refreshed successfully");
          }
        }
      }
      
      // Then refresh user profile with updated session
      await refreshUserProfile();
      setHasTriedRefresh(true);
      console.log("Profile refreshed successfully in ProtectedRoute");
      
    } catch (err) {
      console.error("Failed to refresh auth in ProtectedRoute:", err);
      setHasTriedRefresh(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.id, isRefreshing, session?.expires_at, refreshUserProfile]);

  // Handle timeout logic (fallback for stuck loading)
  useEffect(() => {
    if (!loading) return;
    const timeoutId = setTimeout(() => {
      console.error('Authentication timeout reached. Force fallback to login.');
      setAuthTimeout(true);
    }, 8000);

    return () => clearTimeout(timeoutId);
  }, [loading]);

  // Check if session is invalid (expired token)
  useEffect(() => {
    if (user && session && session.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at < now) {
        console.log('Session expired. Attempting refresh.');
        setSessionInvalid(true);
      }
    }
  }, [user, session]);

  // Handle session refresh if needed
  useEffect(() => {
    if (sessionInvalid && !isRefreshing) {
      setIsRefreshing(true);
      
      // Try to refresh the session
      supabase.auth.refreshSession().then(({ data, error }) => {
        if (error || !data.session) {
          console.error('Session refresh failed:', error);
          setIsRefreshing(false);
          
          if (logout) {
            logout().finally(() => {
              toast.error("Phiên của bạn đã hết hạn. Đăng nhập lại.");
              navigate('/login', { replace: true, state: { from: location, authError: 'expired' } });
            });
          }
        } else {
          console.log('Session refreshed successfully');
          setSessionInvalid(false);
          setIsRefreshing(false);
          
          // Also refresh user profile/roles after successful session refresh
          refreshUserProfile()
            .then(() => {
              console.log("User profile refreshed after session refresh");
              setHasTriedRefresh(true);
            })
            .catch(err => {
              console.error('Error refreshing profile after session refresh:', err);
            });
        }
      });
    }
  }, [sessionInvalid, isRefreshing, logout, navigate, location, refreshUserProfile]);

  // Initial role check and refresh on mount
  useEffect(() => {
    if (isAuthenticated && user && !isRefreshing && !hasTriedRefresh) {
      refreshAuth();
    }
  }, [isAuthenticated, user, isRefreshing, hasTriedRefresh, refreshAuth]);
  
  if (authTimeout) {
    return <Navigate to="/login" state={{ from: location, authError: 'timeout' }} replace />;
  }

  if (isRefreshing) {
    return <AuthLoadingScreen message="Đang làm mới phiên và quyền hạn của bạn..." />;
  }

  if (sessionInvalid) {
    return <AuthLoadingScreen message="Đang xác thực lại..." />;
  }

  if (loading) {
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

  // Special debug logging for role issues
  if (requiredRoles.length > 0) {
    console.log('Required roles:', requiredRoles);
    console.log('User roles:', userRoles);
  }

  const hasRequiredRole = requiredRoles.length === 0 || 
                         requiredRoles.some(role => userRoles.includes(role));

  if (!hasRequiredRole) {
    console.log('User lacks required role - redirecting to unauthorized');
    // Debug which roles are missing
    const missingRoles = requiredRoles.filter(role => !userRoles.includes(role));
    console.error(`Missing required roles: ${missingRoles.join(', ')}`);
    
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

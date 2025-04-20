
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/auth.types';
import AuthLoadingScreen from './AuthLoadingScreen';
import { toast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, requiredRoles = [] }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, userRoles } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [authTimeout, setAuthTimeout] = useState(false);
  
  // Handle timeout logic
  useEffect(() => {
    if (!loading) return;
    
    // Set timeout to handle potential infinite loading state
    const timeoutId = setTimeout(() => {
      console.error('Authentication timeout reached. Force fallback to login.');
      setAuthTimeout(true);
    }, 8000); // 8-second max wait time before force fallback
    
    return () => clearTimeout(timeoutId);
  }, [loading]);
  
  // Force redirect to login if timeout occurs
  useEffect(() => {
    if (authTimeout) {
      console.log('Authentication timeout triggered - redirecting to login');
      toast.error("Phiên đăng nhập hết hạn", "Vui lòng đăng nhập lại");
    }
  }, [authTimeout, navigate]);
  
  // If auth timed out, redirect to login
  if (authTimeout) {
    return <Navigate to="/login" state={{ from: location, authError: 'timeout' }} replace />;
  }
  
  // Show enhanced loading screen while checking authentication
  if (loading) {
    return (
      <AuthLoadingScreen 
        onRetry={() => window.location.reload()}
        onCancel={() => navigate('/')}
      />
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('User not authenticated - redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check for required roles if any
  const hasRequiredRole = requiredRoles.length === 0 || 
                         requiredRoles.some(role => userRoles.includes(role));
  
  // Redirect to unauthorized if doesn't have required role
  if (!hasRequiredRole) {
    console.log('User lacks required role - redirecting to unauthorized');
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  
  // Render children if authenticated and has required roles
  return <>{children}</>;
};

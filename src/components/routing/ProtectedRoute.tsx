
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, checkUserRole } = useAuth();
  const location = useLocation();
  
  // Show loading state while checking auth
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check role requirements if specified
  if (requiredRole && !checkUserRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Render children if authenticated and has required role
  return <>{children}</>;
};

export default ProtectedRoute;

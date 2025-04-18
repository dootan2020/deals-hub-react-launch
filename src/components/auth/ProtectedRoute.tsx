
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, requiredRoles = [] }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, userRoles } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu không có yêu cầu về vai trò hoặc người dùng có ít nhất một vai trò yêu cầu
  if (requiredRoles.length === 0 || requiredRoles.some(role => userRoles.includes(role))) {
    return <>{children}</>;
  }

  return <Navigate to="/unauthorized" state={{ from: location }} replace />;
};

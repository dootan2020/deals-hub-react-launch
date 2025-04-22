
import { ReactNode, useEffect, useState } from 'react';
import { UserRole } from '@/types/auth.types';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import AuthLoadingScreen from '@/components/auth/AuthLoadingScreen';
import { toast } from '@/hooks/use-toast';

interface RoleGuardProps {
  children: ReactNode;
  requiredRoles: UserRole[];
  fallback?: ReactNode;
}

/**
 * A component that renders its children only if the current user has one of the required roles.
 * Otherwise, it renders the fallback or redirects to the unauthorized page.
 */
export const RoleGuard = ({ 
  children, 
  requiredRoles, 
  fallback 
}: RoleGuardProps) => {
  const { userRoles, isAuthenticated, refreshUserProfile, loading, user } = useAuth();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasTriedRefresh, setHasTriedRefresh] = useState(false);
  
  useEffect(() => {
    // Debug logging for role issues
    console.log('RoleGuard - Required roles:', requiredRoles);
    console.log('RoleGuard - User roles:', userRoles);
    console.log('RoleGuard - User authenticated:', isAuthenticated);
    console.log('RoleGuard - User ID:', user?.id);
    
    if (!isAuthenticated) {
      console.warn('RoleGuard - User not authenticated');
    } else if (!requiredRoles.some(role => userRoles.includes(role)) && !hasTriedRefresh && !isRefreshing) {
      console.warn('RoleGuard - User lacks required roles, attempting to refresh profile');
      
      // If authenticated but missing roles, try refreshing profile once
      setIsRefreshing(true);
      refreshUserProfile()
        .then(() => {
          console.log('RoleGuard - Profile refreshed, new roles:', userRoles);
          setHasTriedRefresh(true);
        })
        .catch(err => {
          console.error('Error refreshing profile in RoleGuard:', err);
          toast.error("Không thể cập nhật thông tin quyền hạn", {
            description: "Vui lòng thử tải lại trang"
          });
          setHasTriedRefresh(true);
        })
        .finally(() => {
          setIsRefreshing(false);
        });
    }
  }, [requiredRoles, userRoles, isAuthenticated, refreshUserProfile, user, hasTriedRefresh, isRefreshing]);
  
  // Waiting for auth to complete or profile refresh
  if (loading || isRefreshing) {
    return <AuthLoadingScreen message="Đang kiểm tra quyền truy cập..." />;
  }

  const hasRequiredRole = requiredRoles.some(role => 
    userRoles.includes(role)
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location, authError: 'auth_required' }} replace />;
  }

  if (!hasRequiredRole) {
    console.error(`Access denied - User has roles: [${userRoles.join(', ')}] but needs one of: [${requiredRoles.join(', ')}]`);
    console.log('Redirecting to unauthorized page');
    return fallback ? <>{fallback}</> : <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;

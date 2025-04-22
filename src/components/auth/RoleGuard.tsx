
import { ReactNode, useEffect } from 'react';
import { UserRole } from '@/types/auth.types';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

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
  const { userRoles, isAuthenticated, refreshUserProfile } = useAuth();
  
  useEffect(() => {
    // Debug logging for role issues
    console.log('RoleGuard - Required roles:', requiredRoles);
    console.log('RoleGuard - User roles:', userRoles);
    
    if (!isAuthenticated) {
      console.warn('RoleGuard - User not authenticated');
    } else if (!requiredRoles.some(role => userRoles.includes(role))) {
      console.warn('RoleGuard - User lacks required roles');
      
      // If authenticated but missing roles, try refreshing profile
      refreshUserProfile().catch(err => {
        console.error('Error refreshing profile in RoleGuard:', err);
      });
    }
  }, [requiredRoles, userRoles, isAuthenticated, refreshUserProfile]);
  
  const hasRequiredRole = requiredRoles.some(role => 
    userRoles.includes(role)
  );

  if (!hasRequiredRole) {
    return fallback ? <>{fallback}</> : <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;

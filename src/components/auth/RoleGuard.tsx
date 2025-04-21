
import { ReactNode } from 'react';
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
  const { userRoles } = useAuth();
  
  const hasRequiredRole = requiredRoles.some(role => 
    userRoles.includes(role)
  );

  if (!hasRequiredRole) {
    return fallback ? <>{fallback}</> : <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;

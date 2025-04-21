
import { ReactNode, useMemo } from 'react';
import { UserRole } from '@/types/auth.types';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

interface RoleGuardProps {
  children: ReactNode;
  requiredRoles: UserRole[];
  fallback?: ReactNode;
}

/**
 * An optimized component that renders its children only if the current user has one of the required roles.
 * Otherwise, it renders the fallback or redirects to the unauthorized page.
 */
export const RoleGuard = ({ 
  children, 
  requiredRoles, 
  fallback 
}: RoleGuardProps) => {
  const { userRoles } = useAuth();
  
  // Use useMemo to prevent unnecessary re-evaluations of role checks
  const hasRequiredRole = useMemo(() => 
    requiredRoles.some(role => userRoles.includes(role)),
  [requiredRoles, userRoles]);

  if (!hasRequiredRole) {
    return fallback ? <>{fallback}</> : <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;

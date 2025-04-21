
import { ReactNode, useMemo } from 'react';
import { UserRole } from '@/types/auth.types';
import { useAuth } from '@/context/AuthContext';

interface AccessControlProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  allowedFor?: UserRole[];
  forbiddenFor?: UserRole[];
  fallback?: ReactNode;
}

/**
 * An optimized component that controls access to UI elements based on user roles.
 * It can be used to conditionally render components based on user permissions.
 */
export const AccessControl = ({
  children,
  requiredRoles = [],
  allowedFor = [],
  forbiddenFor = [],
  fallback = null,
}: AccessControlProps) => {
  const { userRoles, isAuthenticated } = useAuth();
  
  // Use useMemo to prevent unnecessary re-evaluations of role checks
  const shouldRender = useMemo(() => {
    // Not authenticated - hide the content
    if (!isAuthenticated) {
      return false;
    }

    // Check if user has required roles (if specified)
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      if (!hasRequiredRole) {
        return false;
      }
    }

    // Check if user has one of the allowed roles (if specified)
    if (allowedFor.length > 0) {
      const isAllowed = allowedFor.some(role => userRoles.includes(role));
      if (!isAllowed) {
        return false;
      }
    }

    // Check if user has forbidden roles (if specified)
    if (forbiddenFor.length > 0) {
      const isForbidden = forbiddenFor.some(role => userRoles.includes(role));
      if (isForbidden) {
        return false;
      }
    }

    // All checks passed
    return true;
  }, [isAuthenticated, userRoles, requiredRoles, allowedFor, forbiddenFor]);

  // Render based on memoized check result
  return shouldRender ? <>{children}</> : <>{fallback}</>;
};

export default AccessControl;

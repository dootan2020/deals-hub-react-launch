
import { ReactNode } from 'react';
import { UserRole, UserRoleType } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface AccessControlProps {
  children: ReactNode;
  requiredRoles?: UserRoleType[];
  allowedFor?: UserRoleType[];
  forbiddenFor?: UserRoleType[];
  fallback?: ReactNode;
}

/**
 * A component that controls access to UI elements based on user roles.
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
  
  // Not authenticated - hide the content
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // Check if user has required roles (if specified)
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    if (!hasRequiredRole) {
      return <>{fallback}</>;
    }
  }

  // Check if user has one of the allowed roles (if specified)
  if (allowedFor.length > 0) {
    const isAllowed = allowedFor.some(role => userRoles.includes(role));
    if (!isAllowed) {
      return <>{fallback}</>;
    }
  }

  // Check if user has forbidden roles (if specified)
  if (forbiddenFor.length > 0) {
    const isForbidden = forbiddenFor.some(role => userRoles.includes(role));
    if (isForbidden) {
      return <>{fallback}</>;
    }
  }

  // All checks passed - render the children
  return <>{children}</>;
};

export default AccessControl;

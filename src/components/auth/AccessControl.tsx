
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

interface AccessControlProps {
  requiredRoles?: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AccessControl: React.FC<AccessControlProps> = ({
  requiredRoles = [],
  children,
  fallback = null
}) => {
  const { isAuthenticated, userRoles } = useAuth();

  // If no roles are required, just check authentication
  if (requiredRoles.length === 0) {
    return isAuthenticated ? <>{children}</> : <>{fallback}</>;
  }

  // Check if user has any of the required roles
  const hasPermission = requiredRoles.some(role => userRoles.includes(role));

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export default AccessControl;

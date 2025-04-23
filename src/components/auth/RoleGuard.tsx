
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth.types';

interface RoleGuardProps {
  requiredRoles: UserRole[];
  redirectPath?: string;
  children?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  requiredRoles = [],
  redirectPath = '/login',
  children
}) => {
  const { isAuthenticated, userRoles, loading } = useAuth();

  // Show nothing while loading authentication
  if (loading) {
    return null;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Check if the user has any of the required roles
  const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
  
  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User has the required role, render children
  return children ? <>{children}</> : <Outlet />;
};

export default RoleGuard;

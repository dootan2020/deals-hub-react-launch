
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/types/auth.types';

interface RoleCheckerProps {
  children: React.ReactNode;
  userRoles: UserRole[];
  requiredRoles: UserRole[];
  roleCheckComplete: boolean;
}

export const RoleChecker: React.FC<RoleCheckerProps> = ({
  children,
  userRoles,
  requiredRoles,
  roleCheckComplete
}) => {
  const location = useLocation();

  if (requiredRoles.length > 0 && !roleCheckComplete && userRoles.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  const hasRequiredRole = requiredRoles.length === 0 || 
                         requiredRoles.some(role => userRoles.includes(role));

  if (!hasRequiredRole) {
    console.log('User lacks required role - redirecting to unauthorized');
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};


import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/types/auth.types';

interface RoleCheckerProps {
  children: React.ReactNode;
  userRoles: UserRole[];
  requiredRoles: UserRole[];
  roleCheckComplete: boolean;
}

export const RoleChecker = ({ 
  children, 
  userRoles, 
  requiredRoles, 
  roleCheckComplete 
}: RoleCheckerProps) => {
  const location = useLocation();
  const [hasRequiredRole, setHasRequiredRole] = useState(requiredRoles.length === 0);

  useEffect(() => {
    if (roleCheckComplete) {
      setHasRequiredRole(
        requiredRoles.length === 0 || 
        requiredRoles.some(role => userRoles.includes(role))
      );
    }
  }, [roleCheckComplete, requiredRoles, userRoles]);

  if (!roleCheckComplete && requiredRoles.length > 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!hasRequiredRole) {
    console.log('User lacks required role - redirecting to unauthorized');
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

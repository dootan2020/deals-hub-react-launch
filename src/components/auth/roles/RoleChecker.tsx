
import React, { useState, useEffect } from 'react';
import { UserRole } from '@/types/auth.types';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface RoleCheckerProps {
  children: React.ReactNode;
  userRoles: UserRole[];
  requiredRoles: UserRole[];
  roleCheckComplete: boolean;
}

/**
 * Component to check if user has required roles before rendering children
 */
export const RoleChecker: React.FC<RoleCheckerProps> = ({
  children,
  userRoles,
  requiredRoles,
  roleCheckComplete
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!roleCheckComplete);

  // Check if user has any of the required roles
  const hasRequiredRoles = requiredRoles.length === 0 || 
    requiredRoles.some(role => userRoles.includes(role));

  // Set up loading state
  useEffect(() => {
    if (roleCheckComplete) {
      // Small delay before rendering to avoid flash
      const timer = setTimeout(() => setLoading(false), 100);
      return () => clearTimeout(timer);
    } else {
      setLoading(true);
    }
  }, [roleCheckComplete]);

  // If no roles required, render children immediately
  if (requiredRoles.length === 0) {
    return <>{children}</>;
  }

  // Show loading while checking roles
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p>Đang kiểm tra quyền truy cập...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user doesn't have required roles, show access denied
  if (!hasRequiredRoles) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Truy cập bị từ chối</h3>
              <p className="text-sm text-gray-500 mb-4">
                Bạn không có quyền truy cập vào trang này.
              </p>
              <Button onClick={() => navigate('/')}>
                Trở về trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User has required roles, render children
  return <>{children}</>;
};

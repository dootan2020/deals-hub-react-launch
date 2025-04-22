
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client'; 
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  roles: string[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  roles, 
  fallback = null, 
  redirectTo 
}) => {
  const { user, userRoles, isLoading: authLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthorization = async () => {
      if (authLoading) return;

      if (!user) {
        setIsAuthorized(false);
        setIsLoading(false);
        if (redirectTo) {
          navigate(redirectTo);
        }
        return;
      }

      // If we have userRoles from context
      if (userRoles && userRoles.length > 0) {
        const hasRole = roles.some(role => userRoles.includes(role));
        setIsAuthorized(hasRole);
        setIsLoading(false);
        
        if (!hasRole && redirectTo) {
          navigate(redirectTo);
        }
        return;
      }

      // If we need to fetch roles directly
      try {
        const { data, error } = await supabase
          .rpc('get_user_roles', { user_id_param: user.id });
          
        if (error) throw error;
        
        const userRoleValues = data ? data.map((r: any) => r.toString()) : [];
        const hasRole = roles.some(role => userRoleValues.includes(role));
        
        setIsAuthorized(hasRole);
        
        if (!hasRole && redirectTo) {
          navigate(redirectTo);
        }
      } catch (error) {
        console.error('Error checking user roles:', error);
        setIsAuthorized(false);
        if (redirectTo) {
          navigate(redirectTo);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [user, userRoles, authLoading, roles, navigate, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <p>You don't have permission to access this page.</p>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;

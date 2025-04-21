import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/auth.types';
import AuthLoadingScreen from './AuthLoadingScreen';
import { toast } from '@/hooks/use-toast';
import { EmailVerificationGate } from "./EmailVerificationGate";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, requiredRoles = [] }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, userRoles, user, logout, session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [authTimeout, setAuthTimeout] = useState(false);
  const [sessionInvalid, setSessionInvalid] = useState(false);
  const [roleCheckComplete, setRoleCheckComplete] = useState(requiredRoles.length === 0);

  useEffect(() => {
    if (!loading) return;
    const timeoutId = setTimeout(() => {
      console.error('Authentication timeout reached. Force fallback to login.');
      setAuthTimeout(true);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [loading]);

  useEffect(() => {
    if (requiredRoles.length > 0 && userRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      setRoleCheckComplete(true);
    }
  }, [requiredRoles, userRoles]);

  useEffect(() => {
    if (authTimeout) {
      console.log('Authentication timeout triggered - redirecting to login');
      toast.error("Phiên đăng nhập hết hạn", "Vui lòng đăng nhập lại");
    }
  }, [authTimeout, navigate]);

  useEffect(() => {
    if (user && session && session.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at < now) {
        setSessionInvalid(true);
      }
    }
  }, [user, session]);

  useEffect(() => {
    if (sessionInvalid && logout) {
      logout().finally(() => {
        toast.error("Phiên của bạn đã hết hạn. Đăng nhập lại.");
        navigate('/login', { replace: true, state: { from: location, authError: 'expired' } });
      });
    }
  }, [sessionInvalid]);

  if (authTimeout) {
    return <Navigate to="/login" state={{ from: location, authError: 'timeout' }} replace />;
  }

  if (sessionInvalid) {
    return null;
  }

  if (loading) {
    return (
      <AuthLoadingScreen 
        onRetry={() => window.location.reload()}
        onCancel={() => navigate('/')}
      />
    );
  }

  if (!isAuthenticated || !user) {
    console.log('User not authenticated - redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && !roleCheckComplete && userRoles.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Verifying access...</p>
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

  return (
    <EmailVerificationGate>
      {children}
    </EmailVerificationGate>
  );
};

export default ProtectedRoute;

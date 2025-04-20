
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { LoginCard } from '@/components/auth/login/LoginCard';
import type { LoginFormValues } from '@/components/auth/login/types';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const { resendVerificationEmail } = useAuthActions();
  const navigate = useNavigate();
  const location = useLocation();
  const [emailNeedsVerification, setEmailNeedsVerification] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Get the redirect URL from the state or default to home
  const from = location.state?.from?.pathname || '/';
  
  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Handle resend cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);
  
  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    setServerError(null);
    setEmailNeedsVerification(null);
    
    try {
      await login(values.email, values.password);
      // Navigation will be triggered by the useEffect when isAuthenticated changes
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.message?.includes('Email not confirmed')) {
        setEmailNeedsVerification(values.email);
      } else {
        setServerError(err.message || 'Đăng nhập thất bại');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!emailNeedsVerification || resendCooldown > 0) return;
    
    setIsLoading(true);
    try {
      await resendVerificationEmail(emailNeedsVerification);
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // If already authenticated, don't render the login form (prevents flash)
  if (isAuthenticated) {
    return null;
  }
  
  return (
    <Layout>
      <div className="container max-w-md py-12">
        <LoginCard
          onSubmit={handleLogin}
          isLoading={isLoading}
          serverError={serverError}
          emailNeedsVerification={emailNeedsVerification}
          resendCooldown={resendCooldown}
          onResendVerification={handleResendVerification}
        />
      </div>
    </Layout>
  );
}

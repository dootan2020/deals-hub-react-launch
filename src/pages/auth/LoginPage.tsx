
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthActions } from '@/hooks/auth/use-auth-actions';
import { toast } from '@/hooks/use-toast';
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
  const authError = location.state?.authError;
  const returnUrl = new URLSearchParams(location.search).get('returnUrl');

  // Set appropriate error message if coming from a redirect due to auth error
  useEffect(() => {
    if (authError === 'expired') {
      setServerError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    } else if (authError === 'timeout') {
      setServerError('Xác thực đã hết thời gian chờ. Vui lòng đăng nhập lại.');
    } else if (authError === 'session_restore_failed') {
      setServerError('Không thể khôi phục phiên đăng nhập. Vui lòng đăng nhập lại.');
    } else if (location.search.includes('expired=1')) {
      setServerError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    } else if (location.search.includes('timeout=1')) {
      setServerError('Phiên đã hết thời gian do không hoạt động. Vui lòng đăng nhập lại.');
    } else if (location.search.includes('network=1')) {
      setServerError('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.');
    }
  }, [authError, location.search]);
  
  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = returnUrl || from;
      console.log('User authenticated, redirecting to:', redirectTo);
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, from, returnUrl]);

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
      // Show loading toast
      const loadingToast = toast.loading("Đang đăng nhập...");
      
      await login(values.email, values.password);
      
      // Close loading toast
      toast.dismiss(loadingToast);
      
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
      // Show loading toast
      const loadingToast = toast.loading("Đang gửi email xác minh...");
      
      await resendVerificationEmail(emailNeedsVerification);
      
      // Close loading toast
      toast.dismiss(loadingToast);
      
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

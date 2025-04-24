
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { LoginCard } from '@/components/auth/login/LoginCard';
import { supabase } from '@/integrations/supabase/client';
import { useLogin } from '@/hooks/auth/use-login';
import { toast } from '@/hooks/use-toast';
import { useVerification } from '@/hooks/auth/use-verification';
import { LoginFormValues } from '@/components/auth/login/types';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailNeedsVerification, setEmailNeedsVerification] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const { login } = useLogin();
  const { resendVerificationEmail } = useVerification();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };

    checkSession();
  }, [navigate]);

  // Handle cooldown timer for verification email resend
  useEffect(() => {
    let timer: number | undefined;
    if (resendCooldown > 0) {
      timer = window.setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  const handleLogin = async (values: LoginFormValues) => {
    console.log('Login form submitted', values);
    setIsLoading(true);
    setServerError(null);
    
    try {
      await login(values.email, values.password);
      console.log('Login successful, redirecting...');
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if the error is due to email not being verified
      if (error.message?.includes('Email not confirmed')) {
        setEmailNeedsVerification(values.email);
      } else {
        setServerError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!emailNeedsVerification) return;
    
    try {
      await resendVerificationEmail(emailNeedsVerification);
      setResendCooldown(60); // Set a 60-second cooldown
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    }
  };

  return (
    <Layout title="Đăng nhập">
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background-secondary">
        <div className="w-full max-w-md">
          <LoginCard
            onSubmit={handleLogin}
            isLoading={isLoading}
            serverError={serverError}
            emailNeedsVerification={emailNeedsVerification}
            resendCooldown={resendCooldown}
            onResendVerification={handleResendVerification}
          />
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;

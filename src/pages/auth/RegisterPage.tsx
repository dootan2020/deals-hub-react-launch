
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthActions } from '@/hooks/auth/use-auth-actions';
import { registerSchema, type RegisterFormValues } from '@/validations/registerSchema';
import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { RegistrationSuccess } from '@/components/auth/RegistrationSuccess';
import { toast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const resendTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { user, isAuthenticated, loading, signUp } = useAuth();
  const { resendVerificationEmail } = useAuthActions();
  const navigate = useNavigate();
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, loading]);
  
  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      resendTimerRef.current = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }

    return () => {
      if (resendTimerRef.current) {
        clearTimeout(resendTimerRef.current);
      }
    };
  }, [resendCooldown]);

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    setIsLoading(true);
    
    try {
      // Show loading toast
      const loadingToast = toast.loading("Đang đăng ký tài khoản...");
      
      // Use signUp from AuthContext
      const result = await signUp(values.email, values.password, {
        display_name: values.displayName
      });
      
      // Close loading toast
      toast.dismiss(loadingToast);
      
      setRegistrationSuccess(true);
      setRegisteredEmail(values.email);
      form.reset();
    } catch (error: any) {
      console.error('Registration error:', error);
      setServerError(error.message || 'Lỗi khi đăng ký tài khoản');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || !registeredEmail) return;
    
    setIsLoading(true);
    try {
      // Show loading toast
      const loadingToast = toast.loading("Đang gửi lại email xác minh...");
      
      await resendVerificationEmail(registeredEmail);
      
      // Close loading toast
      toast.dismiss(loadingToast);
      
      setResendCooldown(60);
    } catch (error) {
      console.error('Resend verification email error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Tạo tài khoản">
      <div className="container max-w-md py-12">
        <Card className="shadow-md border border-gray-200">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Tạo tài khoản</CardTitle>
            <CardDescription>
              Nhập thông tin để tạo tài khoản mới
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {registrationSuccess ? (
              <RegistrationSuccess
                onResendEmail={handleResendEmail}
                resendCooldown={resendCooldown}
                isLoading={isLoading}
                onNavigateToLogin={() => navigate('/login')}
              />
            ) : (
              <RegistrationForm
                form={form}
                onSubmit={onSubmit}
                isLoading={isLoading}
                serverError={serverError}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

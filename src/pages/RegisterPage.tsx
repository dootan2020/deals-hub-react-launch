
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Layout from '@/components/layout/Layout';
import { registerSchema, type RegisterFormValues } from '@/validations/registerSchema';
import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { RegistrationSuccess } from '@/components/auth/RegistrationSuccess';
import { useRegister } from '@/hooks/auth/use-register';
import { useVerification } from '@/hooks/auth/use-verification';
import { toast } from '@/hooks/use-toast';
import { logSecurityEvent } from '@/utils/security';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useRegister();
  const { resendVerificationEmail } = useVerification();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
    mode: 'onBlur',
  });

  const handleSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setServerError(null);

    try {
      // Getting the client IP and user agent for security logging
      const userAgent = navigator.userAgent;
      
      // Register the user with Supabase
      const result = await register(values.email, values.password, {
        display_name: values.displayName,
      });
      
      // Log the successful registration attempt
      await logSecurityEvent({
        type: 'login',
        email: values.email,
        ip_address: 'client-ip', // Will be resolved in the backend
        user_agent: userAgent,
        success: true,
        metadata: {
          registration: true,
          display_name: values.displayName,
        }
      });
      
      // Set success state to show verification message
      setRegistrationSuccess(true);
      setRegisteredEmail(values.email);
      toast.success(
        "Đăng ký thành công",
        "Vui lòng kiểm tra email của bạn để xác nhận tài khoản."
      );
    } catch (error: any) {
      let errorMessage = 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.';
      
      if (error.message.includes('already registered')) {
        errorMessage = 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.';
      } else if (error.message.includes('password')) {
        errorMessage = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.';
      } else if (typeof error.message === 'string') {
        errorMessage = `Lỗi đăng ký: ${error.message}`;
      }
      
      setServerError(errorMessage);
      toast.error("Đăng ký thất bại", errorMessage);
      
      // Log the failed registration attempt
      await logSecurityEvent({
        type: 'login',
        email: values.email,
        ip_address: 'client-ip', // Will be resolved in the backend
        user_agent: userAgent,
        success: false,
        metadata: {
          registration: true,
          error: error.message
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || !registeredEmail) return;
    
    setIsLoading(true);
    try {
      await resendVerificationEmail(registeredEmail);
      
      // Start cooldown timer
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error resending verification:', error);
      toast.error(
        "Gửi lại email thất bại",
        "Không thể gửi lại email xác nhận. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigate('/login');
  };

  return (
    <Layout title="Đăng ký tài khoản">
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background-secondary">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">
                {registrationSuccess ? "Xác nhận email của bạn" : "Tạo tài khoản mới"}
              </h1>
              {!registrationSuccess && (
                <p className="text-text-light mt-2">
                  Đăng ký để trải nghiệm dịch vụ của chúng tôi
                </p>
              )}
            </div>
            
            {registrationSuccess ? (
              <RegistrationSuccess 
                onResendEmail={handleResendVerification}
                resendCooldown={resendCooldown}
                isLoading={isLoading}
                onNavigateToLogin={navigateToLogin}
              />
            ) : (
              <RegistrationForm 
                form={form}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                serverError={serverError}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export { RegisterPage };


import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { isTemporaryEmail, fetchClientIP } from './auth-utils';
import { useEmailValidation } from './use-email-validation';

export const useRegister = () => {
  const { checkEmail } = useEmailValidation();

  const register = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      if (isTemporaryEmail(email)) {
        throw new Error('Temporary email domains are not allowed');
      }

      // Check email status before proceeding
      const emailStatus = await checkEmail(email);

      if (emailStatus.isRateLimited) {
        const unlockTime = emailStatus.unlockTime 
          ? new Date(emailStatus.unlockTime).toLocaleTimeString() 
          : 'later';
        throw new Error(`Too many registration attempts. Please try again after ${unlockTime}`);
      }

      if (emailStatus.emailExists) {
        if (emailStatus.status === 'active') {
          throw new Error('Email đã được đăng ký – hãy đăng nhập hoặc reset mật khẩu');
        } else {
          // If email exists but is pending, resend verification
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/verify`,
            }
          });

          if (resendError) throw resendError;

          toast({
            title: "Gửi lại email xác thực",
            description: "Vui lòng kiểm tra email của bạn để xác nhận tài khoản.",
            variant: "default",
          });

          return { registrationSuccess: true, emailResent: true };
        }
      }

      // Proceed with new registration
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            display_name: metadata?.display_name || email.split('@')[0],
            ...metadata,
            registration_ip: await fetchClientIP(),
            registration_date: new Date().toISOString(),
            user_agent: navigator.userAgent,
          },
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Đăng ký thành công",
        description: "Vui lòng kiểm tra email của bạn để xác nhận tài khoản.",
        variant: "default",
      });
      
      return { ...data, registrationSuccess: true };
    } catch (error: any) {
      let message = 'Lỗi khi đăng ký';
      
      if (error.message.includes('already registered')) {
        message = 'Email này đã được đăng ký';
      } else if (error.message.includes('password')) {
        message = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số';
      } else if (error.message.includes('Temporary email')) {
        message = 'Không chấp nhận email tạm thời. Vui lòng sử dụng địa chỉ email chính thức';
      } else if (error.message.includes('Too many registration attempts')) {
        message = error.message;
      }
      
      toast({
        title: "Đăng ký thất bại",
        description: message,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  return { register };
};

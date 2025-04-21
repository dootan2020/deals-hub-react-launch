
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { isTemporaryEmail, fetchClientIP } from './auth-utils';

export const useRegister = () => {
  const register = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      if (isTemporaryEmail(email)) {
        throw new Error('Temporary email domains are not allowed');
      }

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
      
      toast.success(
        "Đăng ký thành công",
        "Vui lòng kiểm tra email của bạn để xác nhận tài khoản."
      );
      
      return { ...data, registrationSuccess: true };
    } catch (error: any) {
      let message = 'Lỗi khi đăng ký';
      
      if (error.message.includes('already registered')) {
        message = 'Email này đã được đăng ký';
      } else if (error.message.includes('password')) {
        message = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số';
      } else if (error.message.includes('Temporary email')) {
        message = 'Không chấp nhận email tạm thời. Vui lòng sử dụng địa chỉ email chính thức';
      }
      
      toast.error("Đăng ký thất bại", message);
      
      throw error;
    }
  };

  return { register };
};

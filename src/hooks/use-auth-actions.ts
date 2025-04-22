
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAuthActions = () => {
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      toast.success("Đăng nhập thành công", "Chào mừng bạn quay trở lại!");
      
      return data;
    } catch (error: any) {
      let message = 'Lỗi khi đăng nhập';
      
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        message = 'Email hoặc mật khẩu không đúng';
      } else if (error.message.includes('Email not confirmed')) {
        message = 'Vui lòng xác nhận email trước khi đăng nhập';
      }
      
      toast.error("Đăng nhập thất bại", message);
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Đăng xuất thành công", "Hẹn gặp lại bạn!");
    } catch (error: any) {
      toast.error("Đăng xuất thất bại", error.message || 'Lỗi khi đăng xuất');
      
      throw error;
    }
  };

  const register = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      // Check if email is from a temporary email domain
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
      
      toast.success("Đăng ký thành công", "Vui lòng kiểm tra email của bạn để xác nhận tài khoản.");
      
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

  const resendVerificationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        }
      });

      if (error) throw error;

      toast.success("Gửi lại email thành công", "Vui lòng kiểm tra hộp thư của bạn để xác nhận tài khoản.");

      return true;
    } catch (error: any) {
      toast.error("Gửi lại email thất bại", error.message || 'Không thể gửi lại email xác nhận');
      
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success("Yêu cầu đặt lại mật khẩu đã được gửi", "Vui lòng kiểm tra email của bạn để tiếp tục.");

      return true;
    } catch (error: any) {
      toast.error("Đặt lại mật khẩu thất bại", error.message || 'Không thể gửi yêu cầu đặt lại mật khẩu');
      
      throw error;
    }
  };

  return {
    login,
    logout,
    register,
    resendVerificationEmail,
    resetPassword
  };
};

// Helper function to check for temporary email domains
const isTemporaryEmail = (email: string): boolean => {
  const tempEmailDomains = [
    'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'mailinator.com',
    'disposablemail.com', '10minutemail.com', 'throwawaymail.com', 'yopmail.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return tempEmailDomains.includes(domain);
};

// Get client's IP address
const fetchClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return 'unknown';
  }
};

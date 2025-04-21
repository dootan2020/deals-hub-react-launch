
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLogin } from './use-login';
import { useRegister } from './use-register';
import { usePasswordReset } from './use-password-reset';

export const useAuthActions = () => {
  const { login } = useLogin();
  const { register } = useRegister();
  const { resetPassword } = usePasswordReset();

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
      toast.error(
        "Gửi lại email thất bại",
        error.message || 'Không thể gửi lại email xác nhận'
      );
      
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

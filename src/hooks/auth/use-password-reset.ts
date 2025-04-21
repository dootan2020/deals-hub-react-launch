
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const usePasswordReset = () => {
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success(
        "Yêu cầu đặt lại mật khẩu đã được gửi",
        "Vui lòng kiểm tra email của bạn để tiếp tục."
      );

      return true;
    } catch (error: any) {
      toast.error(
        "Đặt lại mật khẩu thất bại",
        error.message || 'Không thể gửi yêu cầu đặt lại mật khẩu'
      );
      
      throw error;
    }
  };

  return { resetPassword };
};

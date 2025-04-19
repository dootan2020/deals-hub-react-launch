
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const usePasswordReset = () => {
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Yêu cầu đặt lại mật khẩu đã được gửi",
        description: "Vui lòng kiểm tra email của bạn để tiếp tục.",
        variant: "default",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Đặt lại mật khẩu thất bại",
        description: error.message || 'Không thể gửi yêu cầu đặt lại mật khẩu',
        variant: "destructive",
      });
      
      throw error;
    }
  };

  return { resetPassword };
};


import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useVerification = () => {
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

      toast.success(
        "Gửi lại email thành công",
        "Vui lòng kiểm tra hộp thư của bạn để xác nhận tài khoản."
      );

      return true;
    } catch (error: any) {
      toast.error(
        "Gửi lại email thất bại",
        error.message || 'Không thể gửi lại email xác nhận'
      );
      
      throw error;
    }
  };

  return { resendVerificationEmail };
};

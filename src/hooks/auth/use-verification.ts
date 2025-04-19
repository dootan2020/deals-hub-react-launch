
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

      toast({
        title: "Gửi lại email thành công",
        description: "Vui lòng kiểm tra hộp thư của bạn để xác nhận tài khoản.",
        variant: "default",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Gửi lại email thất bại",
        description: error.message || 'Không thể gửi lại email xác nhận',
        variant: "destructive",
      });
      
      throw error;
    }
  };

  return { resendVerificationEmail };
};


import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useVerification = () => {
  const resendVerificationEmail = async (email: string) => {
    try {
      // Get the correct redirect URL based on current location
      const origin = window.location.origin;
      const redirectPath = '/auth/verify';
      const redirectTo = `${origin}${redirectPath}`;
      
      console.log('============ VERIFICATION DEBUG INFO ============');
      console.log('Current origin:', origin);
      console.log('Using verification redirect URL:', redirectTo);
      console.log('================================================');
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectTo,
        }
      });

      if (error) {
        console.error("Verification error details:", error);
        throw error;
      }

      toast.success(
        "Gửi lại email thành công",
        "Vui lòng kiểm tra hộp thư của bạn để xác nhận tài khoản."
      );

      console.log("Verification email sent to:", email);
      return true;
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      let errorMessage = 'Không thể gửi lại email xác nhận';
      
      if (error.message) {
        errorMessage = `Lỗi: ${error.message}`;
      }
      
      toast.error(
        "Gửi lại email thất bại",
        errorMessage
      );
      
      throw error;
    }
  };

  return { resendVerificationEmail };
};

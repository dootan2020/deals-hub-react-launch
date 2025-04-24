
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useVerification = () => {
  const resendVerificationEmail = async (email: string) => {
    try {
      // Get the correct redirect URL based on current location
      const origin = window.location.origin;
      const hostname = window.location.hostname;
      const redirectPath = '/auth/verify';
      const redirectTo = `${origin}${redirectPath}`;
      
      console.log('============ DETAILED VERIFICATION DEBUG INFO ============');
      console.log('Current origin:', origin);
      console.log('Current hostname:', hostname);
      console.log('Using verification redirect URL:', redirectTo);
      console.log('Window location:', window.location);
      console.log('Protocol:', window.location.protocol);
      console.log('Host:', window.location.host);
      console.log('Pathname:', window.location.pathname);
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

      console.log("Verification email resend successful");
      console.log("Email sent to:", email);
      console.log("With redirect URL:", redirectTo);

      toast.success(
        "Gửi lại email thành công",
        "Vui lòng kiểm tra hộp thư của bạn để xác nhận tài khoản."
      );

      return true;
    } catch (error: any) {
      console.error("Error sending verification email (full details):", error);
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

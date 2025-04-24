
import { supabase, getSiteUrl, getSupabaseUrl } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useVerification = () => {
  const resendVerificationEmail = async (email: string) => {
    try {
      console.log('🔄 Resending verification email to:', email);
      
      // Get the correct redirect URL based on current location
      const siteUrl = getSiteUrl();
      const redirectTo = `${siteUrl}/auth/verify`;
      
      console.log('============ DETAILED VERIFICATION DEBUG INFO ============');
      console.log('Current origin:', window.location.origin);
      console.log('Current hostname:', window.location.hostname);
      console.log('Using verification redirect URL:', redirectTo);
      console.log('Window location href:', window.location.href);
      console.log('Protocol:', window.location.protocol);
      console.log('Host:', window.location.host);
      console.log('Pathname:', window.location.pathname);
      console.log('Browser locale:', navigator.language);
      console.log('Using Supabase URL:', getSupabaseUrl());
      console.log('==========================================');
      
      console.log('Making supabase.auth.resend call with redirectTo:', redirectTo);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectTo,
        }
      });

      if (error) {
        console.error("❌ Verification error details:", error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error status:', error.status);
        throw error;
      }

      console.log("✅ Verification email resend successful");
      console.log("Email sent to:", email);
      console.log("With redirect URL:", redirectTo);

      toast.success(
        "Gửi lại email thành công",
        "Vui lòng kiểm tra hộp thư của bạn để xác nhận tài khoản."
      );

      return true;
    } catch (error: any) {
      console.error("❌ Error sending verification email (full details):", error);
      let errorMessage = 'Không thể gửi lại email xác nhận';
      
      if (error.message) {
        errorMessage = `Lỗi: ${error.message}`;
      }
      
      if (error.status === 429) {
        errorMessage = 'Quá nhiều yêu cầu. Vui lòng thử lại sau';
      } else if (error.status >= 500) {
        errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau';
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

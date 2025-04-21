
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useVerification = () => {
  const resendVerificationEmail = async (email: string) => {
    try {
      // First try to use the edge function with rate limiting
      try {
        const { data, error } = await supabase.functions.invoke('resend-verification', {
          body: { email }
        });
        
        if (error) {
          // If edge function fails, fall back to direct supabase.auth call
          console.warn('Edge function failed, falling back to direct auth API:', error);
          throw error;
        }
        
        if (data?.success) {
          toast.success(
            "Gửi lại email thành công",
            "Vui lòng kiểm tra hộp thư của bạn để xác nhận tài khoản."
          );
          return true;
        }
        
        // Handle errors from the edge function
        if (data?.error) {
          throw new Error(data.error);
        }
      } catch (edgeFuncError) {
        // Fall back to direct supabase.auth call
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
      }

      return true;
    } catch (error: any) {
      // Special handling for rate limit errors
      if (error.message?.includes('Too Many Requests') || error.status === 429) {
        let retryAfter = 60;
        
        try {
          // Try to extract retry time from error response
          if (typeof error.message === 'string' && error.message.includes('Try again in')) {
            const match = error.message.match(/Try again in (\d+) seconds/);
            if (match && match[1]) {
              retryAfter = parseInt(match[1], 10);
            }
          }
          
          toast.error(
            "Yêu cầu quá nhiều",
            `Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${retryAfter} giây.`
          );
          
          // Enhance the error with retryAfter to use in UI
          const enhancedError = new Error('Too Many Requests') as Error & { retryAfter?: number; status?: number };
          enhancedError.retryAfter = retryAfter;
          enhancedError.status = 429;
          throw enhancedError;
        } catch (parseError) {
          // If parsing fails, use default message
          toast.error(
            "Yêu cầu quá nhiều",
            "Vui lòng thử lại sau vài phút."
          );
        }
      } else {
        // Handle other errors
        toast.error(
          "Gửi lại email thất bại",
          error.message || 'Không thể gửi lại email xác nhận'
        );
      }
      
      throw error;
    }
  };

  return { resendVerificationEmail };
};

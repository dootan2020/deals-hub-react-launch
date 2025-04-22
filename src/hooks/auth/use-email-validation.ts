
import { supabase } from '@/integrations/supabase/client';

export interface EmailValidationResult {
  emailExists: boolean;
  status: 'active' | 'pending' | null;
  lastVerificationSent: Date | null;
  isRateLimited: boolean;
  remainingAttempts: number | null;
  unlockTime: Date | null;
}

export const useEmailValidation = () => {
  const checkEmail = async (email: string): Promise<EmailValidationResult> => {
    try {
      // Check email status
      const { data: statusData, error: statusError } = await supabase
        .rpc('check_email_status', { email_param: email });
      
      if (statusError) throw statusError;

      // Check rate limits
      const { data: rateLimit, error: rateLimitError } = await supabase
        .rpc('check_registration_rate_limit', { email_param: email });
      
      if (rateLimitError) throw rateLimitError;

      return {
        emailExists: statusData?.[0]?.email_exists ?? false,
        status: (statusData?.[0]?.status as 'active' | 'pending' | null) ?? null,
        lastVerificationSent: statusData?.[0]?.last_verification_sent ? new Date(statusData[0].last_verification_sent) : null,
        isRateLimited: rateLimit?.[0]?.is_limited ?? false,
        remainingAttempts: rateLimit?.[0]?.remaining_attempts ?? null,
        unlockTime: rateLimit?.[0]?.unlock_time ? new Date(rateLimit[0].unlock_time) : null,
      };
    } catch (error) {
      console.error('Error checking email:', error);
      return {
        emailExists: false,
        status: null,
        lastVerificationSent: null,
        isRateLimited: false,
        remainingAttempts: null,
        unlockTime: null,
      };
    }
  };

  return { checkEmail };
};

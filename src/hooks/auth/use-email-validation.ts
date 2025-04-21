
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmailStatus {
  exists: boolean;
  status: string | null;
  lastVerificationSent: string | null;
}

interface RateLimit {
  isLimited: boolean;
  remainingAttempts: number | null;
  unlockTime: string | null;
}

export const useEmailValidation = () => {
  const [isChecking, setIsChecking] = useState(false);
  
  const checkEmailStatus = async (email: string): Promise<EmailStatus> => {
    setIsChecking(true);
    try {
      const { data: statusData, error: statusError } = await supabase.rpc('check_email_status', { email_param: email });
      
      if (statusError) throw statusError;
      
      // Default values if no data returned
      const defaultResponse = { exists: false, status: null, lastVerificationSent: null };
      
      if (!statusData || statusData.length === 0) {
        return defaultResponse;
      }
      
      return {
        exists: statusData[0].email_exists || false,
        status: statusData[0].status || null,
        lastVerificationSent: statusData[0].last_verification_sent || null
      };
    } catch (error) {
      console.error('Error checking email status:', error);
      return { exists: false, status: null, lastVerificationSent: null };
    } finally {
      setIsChecking(false);
    }
  };
  
  const checkRateLimit = async (email: string): Promise<RateLimit> => {
    setIsChecking(true);
    try {
      const { data: rateLimit, error: rateLimitError } = await supabase.rpc('check_registration_rate_limit', { email_param: email });
      
      if (rateLimitError) throw rateLimitError;
      
      // Default values if no data returned
      const defaultResponse = { isLimited: false, remainingAttempts: null, unlockTime: null };
      
      if (!rateLimit || rateLimit.length === 0) {
        return defaultResponse;
      }
      
      return {
        isLimited: rateLimit[0].is_limited || false,
        remainingAttempts: rateLimit[0].remaining_attempts,
        unlockTime: rateLimit[0].unlock_time || null
      };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return { isLimited: false, remainingAttempts: null, unlockTime: null };
    } finally {
      setIsChecking(false);
    }
  };
  
  return {
    isChecking,
    checkEmailStatus,
    checkRateLimit
  };
};

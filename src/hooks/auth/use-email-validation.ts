
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EmailStatus {
  emailExists: boolean;
  status: string | null;
  lastVerificationSent: string | null;
}

export interface RateLimit {
  isRateLimited: boolean;
  remainingAttempts: number;
  unlockTime: string | null;
}

export const useEmailValidation = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkEmailStatus = async (email: string): Promise<EmailStatus> => {
    try {
      const { data, error } = await supabase.rpc('check_email_status', { email_param: email });
      
      if (error) throw new Error(error.message);
      
      return {
        emailExists: data?.email_exists || false,
        status: data?.status || null,
        lastVerificationSent: data?.last_verification_sent || null
      };
    } catch (error) {
      console.error('Error checking email status:', error);
      return { emailExists: false, status: null, lastVerificationSent: null };
    }
  };

  const checkRateLimit = async (email: string): Promise<RateLimit> => {
    try {
      const { data, error } = await supabase.rpc('check_registration_rate_limit', { email_param: email });
      
      if (error) throw new Error(error.message);
      
      return {
        isRateLimited: data?.is_limited || false,
        remainingAttempts: data?.remaining_attempts || 0,
        unlockTime: data?.unlock_time || null
      };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return { isRateLimited: false, remainingAttempts: 0, unlockTime: null };
    }
  };

  // Combine the two checks into one function for the UI to use
  const checkEmail = async (email: string) => {
    setIsChecking(true);
    try {
      const [statusData, rateLimit] = await Promise.all([
        checkEmailStatus(email),
        checkRateLimit(email)
      ]);
      
      return {
        emailExists: statusData.emailExists,
        status: statusData.status,
        lastVerificationSent: statusData.lastVerificationSent,
        isRateLimited: rateLimit.isRateLimited,
        remainingAttempts: rateLimit.remainingAttempts,
        unlockTime: rateLimit.unlockTime
      };
    } catch (error) {
      console.error('Error in checkEmail:', error);
      return {
        emailExists: false,
        status: null,
        lastVerificationSent: null,
        isRateLimited: false,
        remainingAttempts: 0,
        unlockTime: null
      };
    } finally {
      setIsChecking(false);
    }
  };

  return {
    isChecking,
    checkEmailStatus,
    checkRateLimit,
    checkEmail
  };
};

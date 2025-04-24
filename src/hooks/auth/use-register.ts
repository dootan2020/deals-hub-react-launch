
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { isTemporaryEmail, fetchClientIP } from './auth-utils';
import { logSecurityEvent } from '@/utils/security';

export const useRegister = () => {
  const register = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      if (isTemporaryEmail(email)) {
        throw new Error('Temporary email domains are not allowed');
      }

      // First, check if the email already exists
      const { data: emailCheck, error: checkError } = await supabase.rpc('check_email_status', { 
        email_param: email 
      });
      
      if (checkError) {
        console.error('Error checking email status:', checkError);
        throw new Error('Unable to verify email status. Please try again.');
      }
      
      if (emailCheck && emailCheck.length > 0 && emailCheck[0]?.email_exists) {
        throw new Error('Email already registered');
      }

      // Get the correct redirect URL based on current location
      const origin = window.location.origin;
      const hostname = window.location.hostname;
      
      // Default redirect path
      const redirectPath = '/auth/verify';
      
      // Construct the complete redirect URL
      const redirectTo = `${origin}${redirectPath}`;
      
      console.log('============ REGISTRATION DEBUG INFO ============');
      console.log('Current origin:', origin);
      console.log('Current hostname:', hostname);
      console.log('Using redirect URL:', redirectTo);
      console.log('User agent:', navigator.userAgent);
      console.log('================================================');

      // Proceed with registration
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            display_name: metadata?.display_name || email.split('@')[0],
            ...metadata,
            registration_ip: await fetchClientIP(),
            registration_date: new Date().toISOString(),
            user_agent: navigator.userAgent,
            registration_origin: origin,
          },
          emailRedirectTo: redirectTo,
        }
      });
      
      if (error) {
        console.error('Supabase signUp error:', error);
        throw error;
      }
      
      console.log('Registration successful:', data);
      return { ...data, registrationSuccess: true };
    } catch (error: any) {
      let message = 'Lỗi khi đăng ký';
      
      if (error.message?.includes('already registered') || error.code === '42P10') {
        message = 'Email này đã được đăng ký';
      } else if (error.message?.includes('password')) {
        message = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số';
      } else if (error.message?.includes('Temporary email')) {
        message = 'Không chấp nhận email tạm thời. Vui lòng sử dụng địa chỉ email chính thức';
      } else if (error.message) {
        message = `Lỗi đăng ký: ${error.message}`;
      }
      
      console.error('Registration error:', error);
      toast.error("Đăng ký thất bại", message);
      throw error;
    }
  };

  return { register };
};

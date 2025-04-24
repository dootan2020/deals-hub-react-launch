
import { supabase, getSiteUrl, getSupabaseUrl } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { isTemporaryEmail, fetchClientIP } from './auth-utils';
import { logSecurityEvent } from '@/utils/security';

export const useRegister = () => {
  const register = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      console.log('🚀 Registration attempt starting for email:', email);
      
      if (isTemporaryEmail(email)) {
        console.error('❌ Registration failed: Temporary email not allowed');
        throw new Error('Temporary email domains are not allowed');
      }

      // First, check if the email already exists
      try {
        console.log('Checking if email exists:', email);
        const { data: emailCheck, error: checkError } = await supabase.rpc('check_email_status', { 
          email_param: email 
        });
        
        if (checkError) {
          console.error('Error checking email status:', checkError);
          throw new Error('Unable to verify email status. Please try again.');
        }
        
        if (emailCheck && emailCheck.length > 0 && emailCheck[0]?.email_exists) {
          console.error('Registration failed: Email already registered', email);
          throw new Error('Email already registered');
        }
        
        console.log('Email check passed:', email);
      } catch (checkError: any) {
        console.error('Error during email check:', checkError);
        throw checkError;
      }

      // Get the correct redirect URL based on current location
      const siteUrl = getSiteUrl();
      const hostname = window.location.hostname;
      
      // Default redirect path
      const redirectPath = '/auth/verify';
      
      // Construct the complete redirect URL
      const redirectTo = `${siteUrl}${redirectPath}`;
      
      console.log('============ DETAILED REGISTRATION DEBUG INFO ============');
      console.log('Current Site URL:', siteUrl);
      console.log('Current hostname:', hostname);
      console.log('Using redirect URL:', redirectTo);
      console.log('User agent:', navigator.userAgent);
      console.log('Window location:', window.location);
      console.log('Protocol:', window.location.protocol);
      console.log('Host:', window.location.host);
      console.log('Pathname:', window.location.pathname);
      console.log('Browser locale:', navigator.language);
      console.log('Using Supabase URL:', getSupabaseUrl());
      console.log('============================================');

      // Proceed with registration
      console.log('Making supabase.auth.signUp call with redirectTo:', redirectTo);
      
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
            registration_origin: siteUrl,
            registration_hostname: hostname,
          },
          emailRedirectTo: redirectTo,
        }
      });
      
      if (error) {
        console.error('❌ Supabase signUp error details:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error status:', error.status);
        throw error;
      }
      
      console.log('✅ Registration successful:', data);
      console.log('Confirmation email should be sent to:', email);
      console.log('With redirect URL:', redirectTo);
      
      return { ...data, registrationSuccess: true };
    } catch (error: any) {
      let message = 'Lỗi khi đăng ký';
      
      console.error('❌ Registration error full details:', error);
      
      if (error.message?.includes('already registered') || error.code === '42P10') {
        message = 'Email này đã được đăng ký';
      } else if (error.message?.includes('password')) {
        message = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số';
      } else if (error.message?.includes('Temporary email')) {
        message = 'Không chấp nhận email tạm thời. Vui lòng sử dụng địa chỉ email chính thức';
      } else if (error.message?.includes('Invalid email')) {
        message = 'Địa chỉ email không hợp lệ';
      } else if (error.status === 429) {
        message = 'Quá nhiều yêu cầu. Vui lòng thử lại sau';
      } else if (error.status >= 500) {
        message = 'Lỗi máy chủ. Vui lòng thử lại sau';
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

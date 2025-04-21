
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useRateLimitedAction } from '@/hooks/use-debounce';
import { useState, useCallback } from 'react';

// Helper function to check for temporary email domains
const isTemporaryEmail = (email: string): boolean => {
  const tempEmailDomains = [
    'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'mailinator.com',
    'disposablemail.com', '10minutemail.com', 'throwawaymail.com', 'yopmail.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return tempEmailDomains.includes(domain);
};

// Get client's IP address
const fetchClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return 'unknown';
  }
};

export const useAuthActions = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  
  // Enhanced login function with rate limit handling
  const login = useCallback(async (email: string, password: string) => {
    try {
      // If we've detected rate limiting, fail early
      if (isRateLimited) {
        throw new Error('Too many login attempts. Please try again later.');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        // Check for rate limit error messages
        if (error.message?.includes('too many requests') || 
            error.message?.includes('Too many login attempts') ||
            error.status === 429) {
          setIsRateLimited(true);
          setTimeout(() => setIsRateLimited(false), 30000); // Reset after 30 seconds
        }
        throw error;
      }
      
      toast.success("Đăng nhập thành công", "Chào mừng bạn quay trở lại!");
      
      return data;
    } catch (error: any) {
      let message = 'Lỗi khi đăng nhập';
      
      // Handle specific error cases
      if (error.message?.includes('Invalid login credentials')) {
        message = 'Email hoặc mật khẩu không đúng';
      } else if (error.message?.includes('Email not confirmed')) {
        message = 'Vui lòng xác nhận email trước khi đăng nhập';
      } else if (error.message?.includes('too many requests') || 
                 error.message?.includes('Too many login attempts') ||
                 error.status === 429) {
        message = 'Quá nhiều lần đăng nhập không thành công. Vui lòng thử lại sau.';
      }
      
      toast.error("Đăng nhập thất bại", message);
      
      throw error;
    }
  }, [isRateLimited]);

  // Regular logout function (no need for rate limiting)
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Đăng xuất thành công", "Hẹn gặp lại bạn!");
    } catch (error: any) {
      toast.error("Đăng xuất thất bại", error.message || 'Lỗi khi đăng xuất');
      
      throw error;
    }
  };

  // Enhanced register function with rate limit handling
  const register = useCallback(async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      // Check if email is from a temporary email domain
      if (isTemporaryEmail(email)) {
        throw new Error('Temporary email domains are not allowed');
      }

      // If we've detected rate limiting, fail early
      if (isRateLimited) {
        throw new Error('Too many registration attempts. Please try again later.');
      }

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
          },
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        }
      });
      
      if (error) {
        // Check for rate limit error messages
        if (error.message?.includes('too many requests') || 
            error.message?.includes('Too many signup attempts') ||
            error.status === 429) {
          setIsRateLimited(true);
          setTimeout(() => setIsRateLimited(false), 60000); // Reset after 1 minute for registrations
        }
        throw error;
      }
      
      toast.success("Đăng ký thành công", "Vui lòng kiểm tra email của bạn để xác nhận tài khoản.");
      
      return { ...data, registrationSuccess: true };
    } catch (error: any) {
      let message = 'Lỗi khi đăng ký';
      
      if (error.message?.includes('already registered')) {
        message = 'Email này đã được đăng ký';
      } else if (error.message?.includes('password')) {
        message = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số';
      } else if (error.message?.includes('Temporary email')) {
        message = 'Không chấp nhận email tạm thời. Vui lòng sử dụng địa chỉ email chính thức';
      } else if (error.message?.includes('too many requests') || 
                 error.message?.includes('Too many signup attempts') ||
                 error.status === 429) {
        message = 'Quá nhiều lần đăng ký. Vui lòng thử lại sau.';
      }
      
      toast.error("Đăng ký thất bại", message);
      
      throw error;
    }
  }, [isRateLimited]);

  // Enhanced resendVerificationEmail with our custom rate-limited endpoint
  const resendVerificationEmail = useCallback(async (email: string) => {
    try {
      // First try our rate-limited edge function
      try {
        const { data, error } = await supabase.functions.invoke('resend-verification', {
          body: { email }
        });
        
        if (error) {
          // Fall back to direct auth API call if edge function fails
          console.warn('Edge function failed, falling back to direct auth API:', error);
          throw error;
        }
        
        if (data?.error) {
          throw new Error(data.error);
        }
        
        toast.success("Gửi lại email thành công", "Vui lòng kiểm tra hộp thư của bạn để xác nhận tài khoản.");
        
        return true;
      } catch (edgeFuncError) {
        // Fall back to direct auth API call
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/verify`,
          }
        });

        if (error) throw error;

        toast.success("Gửi lại email thành công", "Vui lòng kiểm tra hộp thư của bạn để xác nhận tài khoản.");
      }

      return true;
    } catch (error: any) {
      // Check for rate limit errors
      if (error.message?.includes('Too Many Requests') || 
          error.status === 429 || 
          error.message?.includes('too many requests')) {
        
        let retryAfter = 60; // Default retry time
        
        // Try to parse retry time if available
        try {
          if (typeof error.retryAfter === 'number') {
            retryAfter = error.retryAfter;
          } else if (error.message.includes('Try again in')) {
            const match = error.message.match(/Try again in (\d+) seconds/);
            if (match && match[1]) {
              retryAfter = parseInt(match[1], 10);
            }
          }
        } catch (parseError) {
          console.error('Error parsing retry after:', parseError);
        }
        
        toast.error(
          "Quá nhiều yêu cầu",
          `Vui lòng thử lại sau ${retryAfter} giây`
        );
        
        // Enhance the error for UI handling
        const rateLimitError = new Error('Too Many Requests') as Error & { retryAfter?: number; status?: number };
        rateLimitError.retryAfter = retryAfter;
        rateLimitError.status = 429;
        throw rateLimitError;
      } else {
        toast.error(
          "Gửi lại email thất bại", 
          error.message || 'Không thể gửi lại email xác nhận'
        );
      }
      
      throw error;
    }
  }, []);

  // Enhanced resetPassword with rate limiting consideration
  const resetPassword = async (email: string) => {
    try {
      // If we've detected rate limiting, fail early
      if (isRateLimited) {
        throw new Error('Too many password reset attempts. Please try again later.');
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        // Check for rate limit errors
        if (error.message?.includes('too many requests') || error.status === 429) {
          setIsRateLimited(true);
          setTimeout(() => setIsRateLimited(false), 60000); // Reset after 1 minute
        }
        throw error;
      }

      toast.success("Yêu cầu đặt lại mật khẩu đã được gửi", "Vui lòng kiểm tra email của bạn để tiếp tục.");

      return true;
    } catch (error: any) {
      // Better handle rate limit errors
      if (error.message?.includes('too many requests') || error.status === 429) {
        toast.error(
          "Quá nhiều yêu cầu", 
          "Bạn đã gửi quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau."
        );
      } else {
        toast.error(
          "Đặt lại mật khẩu thất bại", 
          error.message || 'Không thể gửi yêu cầu đặt lại mật khẩu'
        );
      }
      
      throw error;
    }
  };

  return {
    login,
    logout,
    register,
    resendVerificationEmail,
    resetPassword,
    isRateLimited
  };
};


import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useLogin = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoggingIn(true);
    
    try {
      console.log('Attempting to login with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('Login error from Supabase:', error);
        throw error;
      }
      
      console.log('Login successful:', !!data.session);
      toast.success("Đăng nhập thành công", "Chào mừng bạn quay trở lại!");
      
      return data;
    } catch (error: any) {
      console.error('Login error details:', error);
      let message = 'Lỗi khi đăng nhập';
      
      if (error.message?.includes('Invalid login credentials')) {
        message = 'Email hoặc mật khẩu không đúng';
      } else if (error.message?.includes('Email not confirmed')) {
        message = 'Vui lòng xác nhận email trước khi đăng nhập';
      }
      
      toast.error("Đăng nhập thất bại", message);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  return { login, isLoggingIn };
};

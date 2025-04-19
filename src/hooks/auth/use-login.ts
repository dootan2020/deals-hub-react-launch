
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useLogin = () => {
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn quay trở lại!",
        variant: "default",
      });
      
      return data;
    } catch (error: any) {
      let message = 'Lỗi khi đăng nhập';
      
      if (error.message.includes('Invalid login credentials')) {
        message = 'Email hoặc mật khẩu không đúng';
      } else if (error.message.includes('Email not confirmed')) {
        message = 'Vui lòng xác nhận email trước khi đăng nhập';
      }
      
      toast({
        title: "Đăng nhập thất bại",
        description: message,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  return { login };
};

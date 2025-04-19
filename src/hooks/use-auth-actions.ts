
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAuthActions = () => {
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
      
      // Handle specific error cases
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

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Đăng xuất thành công",
        description: "Hẹn gặp lại bạn!",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Đăng xuất thất bại",
        description: error.message || 'Lỗi khi đăng xuất',
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const register = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            display_name: metadata?.display_name || email.split('@')[0],
            ...metadata
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Đăng ký thành công",
        description: "Vui lòng kiểm tra email của bạn để xác nhận tài khoản.",
        variant: "default",
      });
      
      return data;
    } catch (error: any) {
      let message = 'Lỗi khi đăng ký';
      
      if (error.message.includes('already registered')) {
        message = 'Email này đã được đăng ký';
      } else if (error.message.includes('password')) {
        message = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
      
      toast({
        title: "Đăng ký thất bại",
        description: message,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  return {
    login,
    logout,
    register
  };
};

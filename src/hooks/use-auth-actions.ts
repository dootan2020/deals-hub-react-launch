
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuthActions = () => {
  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Đăng nhập thành công!');
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi đăng nhập');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Đăng xuất thành công');
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi đăng xuất');
      throw error;
    }
  };

  const register = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      const { error } = await supabase.auth.signUp({ 
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
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác nhận tài khoản.');
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi đăng ký');
      throw error;
    }
  };

  return {
    login,
    logout,
    register
  };
};

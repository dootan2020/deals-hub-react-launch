
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, AuthUser, UserRole } from '@/types/auth.types';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types-extension';

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  isStaff: false,
  userRoles: [],
  userBalance: 0,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  checkUserRole: () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userBalance, setUserBalance] = useState(0);

  const fetchUserBalance = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user balance:', error);
        return;
      }

      if (data) {
        setUserBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Error in fetchUserBalance:', error);
    }
  };

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .rpc('get_user_roles', { user_id_param: userId });

      if (error) {
        console.error('Error fetching user roles:', error);
        setUserRoles([]);
        setIsAdmin(false);
        setIsStaff(false);
        return;
      }

      if (data) {
        const roles = data as UserRole[];
        setUserRoles(roles);
        setIsAdmin(roles.includes('admin'));
        setIsStaff(roles.includes('staff'));
      }
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      setUserRoles([]);
      setIsAdmin(false);
      setIsStaff(false);
    }
  };

  const checkUserRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          const authUser = { ...session.user } as AuthUser;
          setUser(authUser);
          
          fetchUserRoles(authUser.id);
          
          fetchUserBalance(authUser.id);
        } else {
          setUser(null);
          setIsAdmin(false);
          setIsStaff(false);
          setUserRoles([]);
          setUserBalance(0);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        const authUser = { ...session.user } as AuthUser;
        setUser(authUser);
        
        await fetchUserRoles(authUser.id);
        
        await fetchUserBalance(authUser.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const register = async (email: string, password: string) => {
    try {
      // Using signUp with data option to populate user metadata
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            // Initialize any default user data here if needed
            display_name: email.split('@')[0]
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

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isAuthenticated: !!user,
      isAdmin,
      isStaff,
      userRoles,
      userBalance,
      login,
      logout,
      register,
      checkUserRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

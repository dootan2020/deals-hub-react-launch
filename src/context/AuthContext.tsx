
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, AuthUser, UserRole } from '@/types/auth.types';
import { toast } from 'sonner';

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

  // Fetch user balance from profiles table
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

  // Fetch user roles using custom RPC function to avoid TypeScript errors
  const fetchUserRoles = async (userId: string) => {
    try {
      // We'll use a SQL query instead of directly accessing user_roles table
      const { data, error } = await supabase
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

  // Helper function to check if user has a specific role
  const checkUserRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          const authUser = session.user as AuthUser;
          setUser(authUser);
          
          // Fetch user roles
          fetchUserRoles(authUser.id);
          
          // Fetch user balance
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

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        const authUser = session.user as AuthUser;
        setUser(authUser);
        
        // Fetch user roles
        await fetchUserRoles(authUser.id);
        
        // Fetch user balance
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
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
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


import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser, UserRole } from '@/types/auth.types';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types-extension';

// Define the context type here
interface AuthContextProps {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  userRoles: UserRole[];
  userBalance: number;
  refreshUserBalance: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  checkUserRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  isStaff: false,
  userRoles: [],
  userBalance: 0,
  refreshUserBalance: async () => {},
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

  // New function to force refresh the user's balance
  const refreshUserBalance = async () => {
    if (!user?.id) return;
    await fetchUserBalance(user.id);
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

  // Set up listeners for realtime balance updates if needed
  useEffect(() => {
    if (!user?.id) return;

    // Listen for changes to the user's profile
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          console.log('Profile updated:', payload);
          if (payload.new && 'balance' in payload.new) {
            setUserBalance(payload.new.balance as number);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

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
      refreshUserBalance,
      login,
      logout,
      register,
      checkUserRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the useAuth hook without redefining AuthContextType
export const useAuth = () => useContext(AuthContext);

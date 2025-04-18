
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userBalance: number;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateUserBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  loading: true,
  userBalance: 0,
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
  updateUserBalance: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // No console logs in production
        if (process.env.NODE_ENV === 'development') {
          console.log('Auth state changed:', event);
        }
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user balance when authenticated
          setTimeout(() => {
            fetchUserBalance(session.user.id);
          }, 0);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserBalance(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserBalance = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching user balance:', error);
        }
        return;
      }

      if (data) {
        setUserBalance(data.balance || 0);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in fetchUserBalance:', error);
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Đăng nhập thành công!');
      // Navigation will be handled by the component that called this method
      // No direct navigation here since we're outside the Router context
    } catch (error: any) {
      toast.error(`Đăng nhập thất bại: ${error.message}`);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.info('Đã đăng xuất');
      // Navigation will be handled by the NavigateAfterAuth component
    } catch (error: any) {
      toast.error(`Đăng xuất thất bại: ${error.message}`);
    }
  };

  const updateUserBalance = (newBalance: number) => {
    setUserBalance(newBalance);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        userBalance,
        login,
        logout,
        isAuthenticated: !!user,
        updateUserBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

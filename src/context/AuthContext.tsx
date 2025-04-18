
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, AuthUser } from '@/types/auth.types';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  userBalance: 0,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
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

  // Check if user has admin role
  const checkAdminRole = async (userId: string) => {
    try {
      // Using custom SQL function created in the migration
      const { data: hasAdminRole, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      
      return !!hasAdminRole;
    } catch (error) {
      console.error('Error in checkAdminRole:', error);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          const authUser = session.user as AuthUser;
          setUser(authUser);
          
          // Check if user is admin
          const isUserAdmin = await checkAdminRole(authUser.id);
          setIsAdmin(isUserAdmin);
          
          // Fetch user balance
          await fetchUserBalance(authUser.id);
        } else {
          setUser(null);
          setIsAdmin(false);
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
        
        // Check if user is admin
        const isUserAdmin = await checkAdminRole(authUser.id);
        setIsAdmin(isUserAdmin);
        
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
      toast.success('Successfully logged in!');
    } catch (error: any) {
      toast.error(error.message || 'Error during login');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Successfully logged out');
    } catch (error: any) {
      toast.error(error.message || 'Error during logout');
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
      toast.success('Registration successful! Please check your email to verify your account.');
    } catch (error: any) {
      toast.error(error.message || 'Error during registration');
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
      userBalance,
      login,
      logout,
      register,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

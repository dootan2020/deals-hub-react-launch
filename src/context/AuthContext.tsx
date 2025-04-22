import { useContext, createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, User, UserRole } from '@/types/auth.types';
import { prepareQueryId, castData } from '@/utils/supabaseHelpers';

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: false,
  isAuthenticated: false,
  isAdmin: false,
  isStaff: false,
  userRoles: [],
  userBalance: 0,
  refreshUserBalance: async () => { },
  refreshUserProfile: async () => { },
  refreshBalance: async () => { },
  login: async () => { },
  logout: async () => { },
  register: async () => { },
  checkUserRole: () => false,
  isEmailVerified: false,
  resendVerificationEmail: async () => false,
  isLoadingBalance: false,
  signIn: async () => { },
  signOut: async () => { },
  signUp: async () => { },
  assignRole: async () => false,
  removeRole: async () => false,
  toggleUserStatus: async () => false,
  refreshSession: async () => { },
  setUserBalance: () => { },
  fetchUserBalance: async () => 0,
  authError: null,
} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      setSession(session);
      setUser(session?.user as User || null);
      setLoading(false);

      if (session?.user?.id) {
        await fetchUserRoles(session.user.id);
        await fetchUserBalance(session.user.id);
        setIsEmailVerified(!!session.user.email_confirmed_at);
      }
    };

    loadSession();

    supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user as User || null);
      setLoading(false);

      if (session?.user?.id) {
        await fetchUserRoles(session.user.id);
        await fetchUserBalance(session.user.id);
        setIsEmailVerified(!!session.user.email_confirmed_at);
      }
    });
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error);
        throw error;
      }

      setSession(data.session);
      setUser(data.user as User);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setAuthError(error);
        throw error;
      }

      setUser(null);
      setSession(null);
      setUserRoles([]);
      setIsAdmin(false);
      setIsStaff(false);
      setUserBalance(0);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, options?: any) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options,
      });

      if (error) {
        setAuthError(error);
        throw error;
      }

      setSession(data.session);
      setUser(data.user as User);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkUserRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  const resendVerificationEmail = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        console.error('Error resending verification email:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error resending verification email:', error);
      return false;
    }
  };

  const signIn = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });

      if (error) {
        console.error('Error signing in with OTP:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error signing in with OTP:', error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password?: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Error signing up:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  // Assign a role to a user
  const assignRole = async (userId: string, role: UserRole): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role }]);

      if (error) {
        console.error('Error assigning role:', error);
        return false;
      }

      await fetchUserRoles(userId);
      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      return false;
    }
  };

  // Remove a role from a user
  const removeRole = async (userId: string, role: UserRole): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) {
        console.error('Error removing role:', error);
        return false;
      }

      await fetchUserRoles(userId);
      return true;
    } catch (error) {
      console.error('Error removing role:', error);
      return false;
    }
  };

  // Toggle user status (active/inactive)
  const toggleUserStatus = async (userId: string, currentStatus?: boolean): Promise<boolean> => {
    try {
      const newStatus = currentStatus === false;
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: newStatus })
        .eq('id', userId);

      if (error) {
        console.error('Error toggling user status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error toggling user status:', error);
      return false;
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Error refreshing session:', error);
      } else {
        setSession(data.session)
        setUser(data.user as User)
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  }

  // Fetch user roles
  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', prepareQueryId(userId));

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      const roles = (data || []).map(item => castData<{role: any}>(item).role as UserRole);
      setUserRoles(roles);
      setIsAdmin(roles.includes('admin'));
      setIsStaff(roles.includes('staff') || roles.includes('admin'));
      return roles;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  };

  // Fetch user balance
  const fetchUserBalance = async (userId: string) => {
    try {
      setIsLoadingBalance(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', prepareQueryId(userId))
        .single();

      if (error) {
        console.error('Error fetching user balance:', error);
        return 0;
      }

      const balance = castData<{balance: number}>(data).balance || 0;
      setUserBalance(balance);
      return balance;
    } catch (error) {
      console.error('Error fetching user balance:', error);
      return 0;
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Refresh user balance
  const refreshUserBalance = async () => {
    if (user?.id) {
      return await fetchUserBalance(user.id);
    }
    return 0;
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (!session?.user) return;
    try {
      const { data } = await supabase.auth.refreshSession();
      const { session: refreshedSession, user: refreshedUser } = data;
      
      if (refreshedUser) {
        setUser(refreshedUser as User);
        if (refreshedUser.id) {
          await fetchUserRoles(refreshedUser.id);
          await fetchUserBalance(refreshedUser.id);
        }
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  const value = {
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
    isEmailVerified,
    resendVerificationEmail,
    isLoadingBalance,
    signIn,
    signOut,
    signUp,
    assignRole,
    removeRole,
    toggleUserStatus,
    refreshUserBalance,
    refreshUserProfile,
    refreshBalance: refreshUserBalance,
    setUserBalance,
    fetchUserBalance,
    refreshSession,
    authError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

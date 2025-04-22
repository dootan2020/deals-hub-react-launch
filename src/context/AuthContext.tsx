
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import { UserRole } from '@/types/auth.types';
import { useNavigate } from 'react-router-dom';
import { prepareQueryId, castData } from '@/utils/supabaseHelpers';

interface AuthContextType {
  session: Session | null;
  user: SupabaseUser | null;
  userRoles: UserRole[];
  userBalance: number;
  isLoading: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isEmailVerified: boolean;
  isLoadingBalance: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, options?: any) => Promise<any>;
  assignRole: (userId: string, role: UserRole) => Promise<boolean>;
  removeRole: (userId: string, role: UserRole) => Promise<boolean>;
  toggleUserStatus: (userId: string, currentStatus?: boolean) => Promise<boolean>;
  refreshSession: () => Promise<void>;
  refreshUserBalance: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  checkUserRole: (role: UserRole) => boolean;
  resendVerificationEmail: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Computed properties
  const isAuthenticated = !!user && !!session;
  const isAdmin = userRoles.includes('admin');
  const isStaff = userRoles.includes('staff');
  const isEmailVerified = !!user?.email_confirmed_at;
  const loading = isLoading;
  const isLoadingBalance = false;

  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        setSession(initialSession);
        setUser(initialSession?.user || null);

        if (initialSession?.user?.id) {
          await fetchUserRoles(initialSession.user.id);
          await fetchUserBalance(initialSession.user.id);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user?.id) {
        await fetchUserRoles(currentSession.user.id);
        await fetchUserBalance(currentSession.user.id);
      } else {
        setUserRoles([]);
        setUserBalance(0);
      }
    });
  }, []);

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', prepareQueryId(userId));

      if (error) throw error;

      // Use castArrayData to ensure proper typing
      const roleData = castData(data, []);
      const roles = roleData ? roleData.map(item => item.role as UserRole) : [];
      setUserRoles(roles);
      return roles;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setUserRoles([]);
      return [];
    }
  };

  const fetchUserBalance = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', prepareQueryId(userId))
        .single();

      if (error) throw error;
      
      const profileData = castData(data, { balance: 0 });
      const balance = profileData.balance || 0;
      setUserBalance(balance);
      return balance;
    } catch (error) {
      console.error('Error fetching user balance:', error);
      setUserBalance(0);
      return 0;
    }
  };

  const signIn = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert('Check your email for the magic link to sign in.');
    } catch (error) {
      console.error('Error signing in:', error);
      alert(`Error signing in: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUserRoles([]);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      alert(`Error signing out: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for compatibility
  const logout = signOut;

  const signUp = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      alert('Check your email to confirm your registration.');
    } catch (error) {
      console.error('Error signing up:', error);
      alert(`Error signing up: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for compatibility
  const register = signUp;
  const login = async (email: string, password: string) => {
    // Implementation
    return { user: null, session: null, error: new Error('Not implemented') };
  };

  const assignRole = async (userId: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Create a properly typed object for inserting
      const roleData = {
        user_id: userId,
        role: role
      };

      const { error } = await supabase
        .from('user_roles')
        .insert(roleData);

      if (error) throw error;
      
      if (userId === user?.id) {
        await fetchUserRoles(userId);
      }
      
      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeRole = async (userId: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
      
      if (userId === user?.id) {
        await fetchUserRoles(userId);
      }
      
      return true;
    } catch (error) {
      console.error('Error removing role:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean = true): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error toggling user status:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      setSession(data.session);
      setUser(data.session?.user || null);

      if (data.session?.user?.id) {
        await fetchUserRoles(data.session.user.id);
        await fetchUserBalance(data.session.user.id);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Additional helper methods for compatibility
  const refreshUserBalance = async () => {
    if (user?.id) {
      await fetchUserBalance(user.id);
    }
  };
  
  const refreshUserProfile = async () => {
    if (user?.id) {
      await fetchUserRoles(user.id);
      await fetchUserBalance(user.id);
    }
  };
  
  const refreshBalance = refreshUserBalance;
  
  const checkUserRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };
  
  const resendVerificationEmail = async (email: string): Promise<boolean> => {
    try {
      // Implementation depends on your auth setup
      return true;
    } catch (error) {
      return false;
    }
  };

  const value: AuthContextType = {
    session,
    user,
    userRoles,
    userBalance,
    isLoading,
    isAuthenticated,
    loading,
    isAdmin,
    isStaff,
    isEmailVerified,
    isLoadingBalance,
    signIn,
    signOut,
    logout,
    signUp,
    login,
    register,
    assignRole,
    removeRole,
    toggleUserStatus,
    refreshSession,
    refreshUserBalance,
    refreshUserProfile,
    refreshBalance,
    checkUserRole,
    resendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

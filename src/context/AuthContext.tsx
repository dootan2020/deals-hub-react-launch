import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/use-auth-state';
import { UserRole } from '@/types/auth.types';
import { extractSafeData } from '@/utils/helpers';
import { getUserWithRoles } from '@/utils/security';

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  isAuthenticated: boolean;
  balance: number | null;
  balanceLoading: boolean;
  fetchBalance: (userId: string) => Promise<number | null>;
  isAdmin: boolean;
  userRoles: UserRole[];
  userBalance: number | null;
  setUserBalance: React.Dispatch<React.SetStateAction<number | null>>;
  fetchUserBalance: (userId: string) => Promise<number | null>;
  refreshUserData: () => Promise<void>;
  isLoadingBalance: boolean;
  authError: string | null;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<any>;
  refreshUserProfile: () => Promise<void>;
  refreshUserBalance: () => Promise<number | null>;
  checkUserRole?: (role: UserRole) => boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  balance: null,
  balanceLoading: false,
  fetchBalance: async () => null,
  userRoles: [],
  isAdmin: false,
  userBalance: null,
  setUserBalance: () => {},
  fetchUserBalance: async () => null,
  refreshUserData: async () => {},
  isLoadingBalance: false,
  authError: null,
  logout: async () => {},
  login: async () => {},
  signUp: async () => ({}),
  refreshUserProfile: async () => {},
  refreshUserBalance: async () => null,
  checkUserRole: () => false
});

export const useAuth = (): AuthContextType => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const { 
    user, 
    session, 
    loading, 
    isAuthenticated, 
    balance,
    balanceLoading,
    fetchBalance 
  } = useAuthState();

  const isAdmin = userRoles.includes(UserRole.Admin);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserRoles();
      fetchUserBalance(user.id);
    } else {
      setUserRoles([]);
      setUserBalance(null);
    }
  }, [isAuthenticated, user]);

  const fetchUserRoles = async () => {
    try {
      if (!user) return;
      
      const userData = await getUserWithRoles(user.id);
      
      if (userData && Array.isArray(userData.roles)) {
        setUserRoles(userData.roles as UserRole[]);
      }
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
    }
  };

  const fetchUserBalance = async (userId: string): Promise<number | null> => {
    if (!userId) return null;
    
    setIsLoadingBalance(true);
    try {
      const balanceValue = await fetchBalance(userId);
      setUserBalance(balanceValue);
      return balanceValue;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return null;
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const refreshUserData = async () => {
    try {
      if (user && user.id) {
        await fetchUserBalance(user.id);
        await fetchUserRoles();
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };
  
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUserRoles([]);
      setUserBalance(null);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };
  
  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };
  
  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            display_name: metadata?.display_name || email.split('@')[0],
            ...metadata,
          },
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        }
      });
      
      if (error) throw error;
      
      return { ...data, registrationSuccess: true };
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  };
  
  const refreshUserBalance = async (): Promise<number | null> => {
    if (!user || !user.id) return null;
    return fetchUserBalance(user.id);
  };
  
  const refreshUserProfile = async (): Promise<void> => {
    try {
      if (!user || !user.id) return;
      
      await supabase.auth.refreshSession();
      
      await refreshUserData();
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };
  
  const checkUserRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated,
        balance,
        balanceLoading,
        fetchBalance,
        isAdmin,
        userRoles,
        userBalance,
        setUserBalance,
        fetchUserBalance,
        refreshUserData,
        isLoadingBalance,
        authError,
        logout,
        login,
        signUp,
        refreshUserProfile,
        refreshUserBalance,
        checkUserRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

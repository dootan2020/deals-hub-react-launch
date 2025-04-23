
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/use-auth-state';
import { UserRole } from '@/types/index';
import { extractSafeData } from '@/utils/supabaseHelpers';

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  isAuthenticated: boolean;
  balance: number | null;
  balanceLoading: boolean;
  fetchBalance: (userId: string) => Promise<number | null>;
  isAdmin: boolean;
  isStaff: boolean;
  userRoles: UserRole[];
  userBalance: number | null;
  setUserBalance: React.Dispatch<React.SetStateAction<number | null>>;
  fetchUserBalance: (userId: string) => Promise<number | null>;
  refreshUserData: () => Promise<void>;
  isLoadingBalance: boolean;
  authError: string | null;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  refreshUserBalance: () => Promise<number | null>;
  checkUserRole?: (role: UserRole) => boolean;
}

// Create a context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  balance: null,
  balanceLoading: false,
  fetchBalance: async () => null,
  isAdmin: false,
  isStaff: false,
  userRoles: [],
  userBalance: null,
  setUserBalance: () => {},
  fetchUserBalance: async () => null,
  refreshUserData: async () => {},
  isLoadingBalance: false,
  authError: null,
  logout: async () => {},
  refreshUserProfile: async () => {},
  refreshUserBalance: async () => null,
  checkUserRole: (role: UserRole) => false
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

  // Check if user has admin role
  const isAdmin = userRoles.includes(UserRole.Admin);
  const isStaff = userRoles.includes(UserRole.Staff);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserRoles();
      fetchUserBalance(user.id);
    } else {
      // Reset roles when logged out
      setUserRoles([]);
      setUserBalance(null);
    }
  }, [isAuthenticated, user]);

  const fetchUserRoles = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error fetching user roles:', error);
        return;
      }
      
      if (data && Array.isArray(data)) {
        const roles = data.map(item => {
          const roleData = extractSafeData<{ role: UserRole }>(item);
          return roleData ? roleData.role : UserRole.User;
        });
        setUserRoles(roles);
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
        // Refresh balance
        await fetchUserBalance(user.id);
        // Refresh roles
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
  
  const refreshUserBalance = async (): Promise<number | null> => {
    if (!user || !user.id) return null;
    return fetchUserBalance(user.id);
  };
  
  const refreshUserProfile = async (): Promise<void> => {
    try {
      if (!user || !user.id) return;
      
      // Refresh the session
      await supabase.auth.refreshSession();
      
      // Refresh the user data
      await refreshUserData();
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };
  
  const checkUserRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  // Provide auth context to the app
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
        isStaff,
        userRoles,
        userBalance,
        setUserBalance,
        fetchUserBalance,
        refreshUserData,
        isLoadingBalance,
        authError,
        logout,
        refreshUserProfile,
        refreshUserBalance,
        checkUserRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

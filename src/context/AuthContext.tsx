
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/use-auth-state';
import { UserRole } from '@/types';

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
  authError: null
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
        const roles = data.map(item => item.role as UserRole);
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
        authError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { useAuthState } from '@/hooks/auth/use-auth-state';
import { useAuthActions } from '@/hooks/auth/use-auth-actions';
import { useBalanceListener } from '@/hooks/use-balance-listener';
import { AuthContextType, User, UserRole } from '@/types/auth.types';
import { toast } from 'sonner';
import { useSessionTimeout } from '@/hooks/auth/use-session-timeout';
import { useSessionMonitor } from '@/hooks/auth/use-session-monitoring';
import { useSessionRefresh } from '@/hooks/auth/use-session-refresh';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  isStaff: false,
  userRoles: [],
  userBalance: 0,
  refreshUserBalance: async () => {},
  refreshUserProfile: async () => {},
  refreshBalance: async () => {},
  login: async () => {},
  logout: async () => {},
  register: async () => ({}),
  checkUserRole: () => false,
  isEmailVerified: false,
  resendVerificationEmail: async () => false,
  isLoadingBalance: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hydrated, setHydrated] = useState(false);
  const [manualSessionCheck, setManualSessionCheck] = useState(false);
  
  const {
    user,
    session,
    loading,
    isAdmin,
    isStaff,
    userRoles,
    userBalance,
    setUserBalance,
    fetchUserBalance,
    refreshUserData,
    isLoadingBalance,
    authError,
    setUser,
    setSession
  } = useAuthState();

  const { login: authLogin, logout, register, resendVerificationEmail } = useAuthActions();

  useSessionTimeout(!!user, user?.id, session?.access_token, logout);
  useSessionMonitor(session, logout);
  useSessionRefresh(session);

  useEffect(() => {
    const checkSession = async () => {
      console.log('🔍 Session check starting...');
      setManualSessionCheck(true);
      try {
        console.log('Explicitly checking for existing session...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
        } else if (data.session) {
          console.log('✅ Existing session found:', { 
            userId: data.session.user.id,
            expiresAt: new Date(data.session.expires_at! * 1000).toLocaleString()
          });
          
          // CRITICAL FIX: Convert Supabase User to App User format
          const supabaseUser = data.session.user;
          const appUser = {
            ...supabaseUser,
            email: supabaseUser.email || null,
          } as User;
          
          // Explicitly update user and session
          console.debug('Setting user and session from checkSession()', appUser.id);
          setUser(appUser);
          setSession(data.session);
          
          // Unblock UI rendering immediately
          setHydrated(true);
          
          // Load additional user data in background
          if (data.session.user.id) {
            console.debug('Starting background user data refresh');
            refreshUserData().catch(err => {
              console.error('Background user data refresh failed:', err);
            });
          }
        } else {
          console.log('❌ No existing session found');
          // Make sure to set hydrated even if no session is found
          setHydrated(true);
        }
      } catch (err) {
        console.error('Exception during session check:', err);
        // Make sure to set hydrated even if there's an error
        setHydrated(true);
      } finally {
        console.log('🏁 Session check completed');
        setManualSessionCheck(false);
      }
    };
    
    checkSession();
  }, [refreshUserData, setSession, setUser]);

  useEffect(() => {
    if (authError) {
      console.error('Authentication error:', authError);
      toast.error('Lỗi xác thực', { description: authError.message });
    }
  }, [authError]);

  useBalanceListener(user?.id, (newBalance) => {
    if (typeof newBalance === 'number') {
      console.log('Balance updated via listener:', newBalance);
      setUserBalance(newBalance);
    }
  });

  const refreshUserBalance = useCallback(async (): Promise<void> => {
    if (!user?.id) return;
    console.log('Manually refreshing user balance for ID:', user.id);

    try {
      const balance = await fetchUserBalance(user.id);
      setUserBalance(balance);
    } catch (error) {
      console.error('Error refreshing balance:', error);
      toast.error('Không thể cập nhật số dư', { description: 'Vui lòng thử lại sau' });
      throw error;
    }
  }, [user?.id, fetchUserBalance, setUserBalance]);

  const refreshBalance = useCallback(async (): Promise<void> => {
    await refreshUserBalance();
  }, [refreshUserBalance]);

  const refreshUserProfile = useCallback(async () => {
    if (!user?.id) return;
    console.log('Refreshing full user profile for ID:', user.id);

    try {
      await refreshUserData();
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      toast.error('Không thể cập nhật hồ sơ người dùng', { description: 'Vui lòng thử lại sau' });
      throw error;
    }
  }, [user?.id, refreshUserData]);

  const login = async (email: string, password: string): Promise<void> => {
    await authLogin(email, password);
  };

  const checkUserRole = useCallback((role: UserRole): boolean => {
    return userRoles.includes(role);
  }, [userRoles]);

  const isEmailVerified = user?.email_confirmed_at !== null;

  // CRITICAL FIX: Compute isAuthenticated directly from user existence
  const isAuthenticated = !!user;
  
  console.debug('AuthContext state update:', { 
    isAuthenticated, 
    userId: user?.id || 'none',
    hasSession: !!session,
    loading,
    hydrated,
    manualSessionCheck
  });

  const contextValue = useMemo(() => ({
    user,
    session,
    // IMPORTANT: Do not include manualSessionCheck in loading state
    loading, 
    isAuthenticated,
    isAdmin,
    isStaff,
    userRoles,
    userBalance,
    isLoadingBalance,
    refreshUserBalance,
    refreshUserProfile,
    refreshBalance,
    login,
    logout,
    register,
    checkUserRole,
    isEmailVerified,
    resendVerificationEmail,
  }), [
    user, session, loading, isAdmin, isStaff, userRoles, userBalance,
    isLoadingBalance, refreshUserBalance, refreshUserProfile, refreshBalance, 
    logout, register, checkUserRole, isEmailVerified, resendVerificationEmail, isAuthenticated
  ]);

  // Show loading indicator only during initial hydration
  if (!hydrated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Khởi tạo ứng dụng...</span>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

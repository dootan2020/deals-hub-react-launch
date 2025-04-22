
import React, { createContext, useContext, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useAuthActions } from '@/hooks/auth/use-auth-actions';
import { useBalanceListener } from '@/hooks/use-balance-listener';
import { AuthContextType, User, UserRole } from '@/types/auth.types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Consolidating session management into a single context
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
  // Core state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userBalance, setUserBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Auth session control
  const [hydrated, setHydrated] = useState(false);
  const refreshInProgress = useRef(false);
  const lastSessionCheck = useRef(0);
  const sessionCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const authListenerRef = useRef<{ data: { subscription: { unsubscribe: () => void } } } | null>(null);

  const { login: authLogin, logout, register, resendVerificationEmail } = useAuthActions();

  // Derived state
  const isAdmin = userRoles.includes('admin');
  const isStaff = userRoles.includes('staff');
  const isEmailVerified = user?.email_confirmed_at !== null;
  
  // CRITICAL FIX: Compute isAuthenticated with strict validation
  const isAuthenticated = Boolean(
    user?.id && 
    session?.access_token && 
    session?.expires_at && 
    session.expires_at * 1000 > Date.now()
  );

  useEffect(() => {
    if (authError) {
      console.error('Authentication error:', authError);
      toast.error('Lỗi xác thực', { description: authError.message });
    }
  }, [authError]);

  // Fetch user roles with caching
  const fetchUserRoles = useCallback(async (userId: string): Promise<UserRole[]> => {
    try {
      // Check cache first (5 minute expiry)
      const cachedRolesData = localStorage.getItem(`user_roles_${userId}`);
      if (cachedRolesData) {
        const { roles, timestamp } = JSON.parse(cachedRolesData);
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        
        if (timestamp > fiveMinutesAgo) {
          return roles as UserRole[];
        }
      }
      
      console.debug(`Fetching roles for user ${userId}`);
      const { data, error } = await supabase.rpc('get_user_roles', {
        user_id_param: userId
      });
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      // Cache roles with timestamp
      localStorage.setItem(`user_roles_${userId}`, JSON.stringify({
        roles: data,
        timestamp: Date.now()
      }));
      
      return data as UserRole[];
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      return [];
    }
  }, []);

  // Fetch user balance with caching
  const fetchUserBalance = useCallback(async (userId: string): Promise<number> => {
    if (isLoadingBalance) return userBalance;
    
    setIsLoadingBalance(true);
    
    try {
      // Use cached balance if less than 30 seconds old
      const cachedBalanceData = localStorage.getItem(`user_balance_${userId}`);
      if (cachedBalanceData) {
        const { balance, timestamp } = JSON.parse(cachedBalanceData);
        const thirtySecondsAgo = Date.now() - 30 * 1000;
        
        if (timestamp > thirtySecondsAgo) {
          setUserBalance(balance);
          return balance;
        }
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user balance:', error);
        return userBalance;
      }
      
      const balance = data?.balance || 0;
      setUserBalance(balance);
      
      // Cache balance
      localStorage.setItem(`user_balance_${userId}`, JSON.stringify({
        balance,
        timestamp: Date.now()
      }));
      
      return balance;
    } catch (error) {
      console.error('Error in fetchUserBalance:', error);
      return userBalance;
    } finally {
      setIsLoadingBalance(false);
    }
  }, [userBalance, isLoadingBalance]);

  // Combined data refresh with debouncing
  const refreshUserData = useCallback(async () => {
    if (!user?.id || refreshInProgress.current) return;
    
    // Prevent concurrent refreshes
    refreshInProgress.current = true;
    
    try {
      // First get roles
      const roles = await fetchUserRoles(user.id);
      setUserRoles(roles);
      
      // Then get balance with slight delay to avoid parallel requests
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchUserBalance(user.id);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Không thể cập nhật hồ sơ người dùng', { description: 'Vui lòng thử lại sau' });
    } finally {
      refreshInProgress.current = false;
    }
  }, [user?.id, fetchUserRoles, fetchUserBalance]);

  // Central auth state change handler
  const handleAuthStateChange = useCallback((event: string, newSession: any) => {
    console.debug(`Auth event: ${event}`);
    
    // Always update session state immediately
    setSession(prevSession => {
      if (JSON.stringify(prevSession) !== JSON.stringify(newSession)) {
        console.debug('Session updated');
        return newSession;
      }
      return prevSession;
    });
    
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (newSession?.user) {
        // Convert Supabase User to App User format
        const supabaseUser = newSession.user;
        const appUser = {
          ...supabaseUser,
          email: supabaseUser.email || null,
        } as User;
        
        setUser(appUser);
        setLoading(false);
        
        // Only load user roles and balance on initial sign-in
        if (event === 'SIGNED_IN') {
          // Reset and load user data after brief delay
          setUserRoles([]);
          setTimeout(() => {
            if (newSession?.user?.id) {
              fetchUserRoles(newSession.user.id)
                .then(roles => setUserRoles(roles))
                .catch(err => console.error('Error loading roles:', err));

              fetchUserBalance(newSession.user.id)
                .catch(err => console.error('Error loading balance:', err));
            }
          }, 100);
        }
      }
    } else if (event === 'SIGNED_OUT') {
      // Clear all user data on sign out
      setUser(null);
      setUserRoles([]);
      setUserBalance(0);
      setSession(null);
      setLoading(false);
      
      if (user?.id) {
        localStorage.removeItem(`user_roles_${user.id}`);
        localStorage.removeItem(`user_balance_${user.id}`);
      }
    } else if (event === 'INITIAL_SESSION') {
      if (newSession?.user) {
        // Convert Supabase User to App User format
        const supabaseUser = newSession.user;
        const appUser = {
          ...supabaseUser,
          email: supabaseUser.email || null,
        } as User;
        
        setUser(appUser);
      }
      setLoading(false);
    }
  }, [fetchUserRoles, fetchUserBalance, user?.id]);

  // Set up auth state listener and check initial session
  useEffect(() => {
    // Clean up existing listener if any
    if (authListenerRef.current) {
      console.log('Cleaning up existing auth listener');
      authListenerRef.current.data.subscription.unsubscribe();
      authListenerRef.current = null;
    }

    console.log('🔄 Setting up auth listener');
    
    // Set up new auth state listener
    authListenerRef.current = supabase.auth.onAuthStateChange(handleAuthStateChange);
    
    // Check initial session
    const checkSession = async () => {
      console.log('🔍 Initial session check starting');
      const startTime = performance.now();
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          setAuthError(error);
          setHydrated(true);
          setLoading(false);
        } else if (data.session) {
          const duration = performance.now() - startTime;
          console.log(`✅ Session found in ${duration.toFixed(1)}ms`);
          
          // Convert Supabase User to App User format
          const supabaseUser = data.session.user;
          const appUser = {
            ...supabaseUser,
            email: supabaseUser.email || null,
          } as User;
          
          setUser(appUser);
          setSession(data.session);
          setHydrated(true);
          setLoading(false);
          
          // Load additional user data in background
          setTimeout(() => {
            if (data.session?.user?.id) {
              fetchUserRoles(data.session.user.id)
                .then(roles => setUserRoles(roles))
                .catch(err => console.error('Error loading roles:', err));
              
              fetchUserBalance(data.session.user.id)
                .catch(err => console.error('Error loading balance:', err));
            }
          }, 100);
        } else {
          console.log('❌ No session found');
          setHydrated(true);
          setLoading(false);
        }
      } catch (err) {
        console.error('Exception during session check:', err);
        setHydrated(true);
        setLoading(false);
      }
      
      // Set up periodic session check (every 5 minutes)
      sessionCheckTimeout.current = setTimeout(() => {
        const now = Date.now();
        // Only check if more than 5 minutes since last check
        if (now - lastSessionCheck.current > 5 * 60 * 1000) {
          lastSessionCheck.current = now;
          if (session?.expires_at) {
            const expiresAt = session.expires_at * 1000;
            const timeRemaining = expiresAt - now;
            
            if (timeRemaining < 5 * 60 * 1000 && timeRemaining > 0) {
              console.log(`Session expires in ${Math.floor(timeRemaining/1000)}s, refreshing...`);
              supabase.auth.refreshSession();
            }
          }
        }
      }, 5 * 60 * 1000);
    };
    
    checkSession();
    
    // Clean up on unmount
    return () => {
      if (authListenerRef.current) {
        console.log('Cleaning up auth listener on unmount');
        authListenerRef.current.data.subscription.unsubscribe();
        authListenerRef.current = null;
      }
      
      if (sessionCheckTimeout.current) {
        clearTimeout(sessionCheckTimeout.current);
        sessionCheckTimeout.current = null;
      }
    };
  }, [handleAuthStateChange, fetchUserRoles, fetchUserBalance]);

  // Set up balance listener when user is authenticated
  useBalanceListener(user?.id, (newBalance) => {
    if (typeof newBalance === 'number') {
      console.log('Balance updated via listener:', newBalance);
      setUserBalance(newBalance);
    }
  });

  // Manual balance refresh function
  const refreshUserBalance = useCallback(async (): Promise<void> => {
    if (!user?.id) return;
    
    try {
      const balance = await fetchUserBalance(user.id);
      setUserBalance(balance);
    } catch (error) {
      console.error('Error refreshing balance:', error);
      toast.error('Không thể cập nhật số dư', { description: 'Vui lòng thử lại sau' });
    }
  }, [user?.id, fetchUserBalance]);

  // Alias for refreshUserBalance for backward compatibility
  const refreshBalance = useCallback(async (): Promise<void> => {
    await refreshUserBalance();
  }, [refreshUserBalance]);

  // Function to refresh entire user profile
  const refreshUserProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await refreshUserData();
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      toast.error('Không thể cập nhật hồ sơ người dùng', { description: 'Vui lòng thử lại sau' });
    }
  }, [user?.id, refreshUserData]);

  // Login function with proper error handling
  const login = async (email: string, password: string): Promise<void> => {
    await authLogin(email, password);
  };

  // Role checking utility
  const checkUserRole = useCallback((role: UserRole): boolean => {
    return userRoles.includes(role);
  }, [userRoles]);

  // Context value
  const contextValue = useMemo(() => ({
    user,
    session,
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
    user, session, loading, isAuthenticated, isAdmin, isStaff, 
    userRoles, userBalance, isLoadingBalance, refreshUserBalance, 
    refreshUserProfile, refreshBalance, logout, register,
    checkUserRole, isEmailVerified, resendVerificationEmail
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

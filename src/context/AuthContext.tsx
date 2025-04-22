import React, { createContext, useContext, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useAuthActions } from '@/hooks/auth/use-auth-actions';
import { useBalanceListener } from '@/hooks/use-balance-listener';
import { AuthContextType, User, UserRole } from '@/types/auth.types';
import { toast } from 'sonner';
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userBalance, setUserBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const refreshInProgress = useRef(false);
  const lastSessionCheck = useRef(0);
  const sessionCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const authListenerRef = useRef<{ data: { subscription: { unsubscribe: () => void } } } | null>(null);

  const { login: authLogin, logout, register, resendVerificationEmail } = useAuthActions();

  const isAdmin = userRoles.includes('admin');
  const isStaff = userRoles.includes('staff');
  const isEmailVerified = user?.email_confirmed_at !== null;
  
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

  const fetchUserRoles = useCallback(async (userId: string): Promise<UserRole[]> => {
    try {
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

  const loadUserBalance = async (userId: string) => {
    try {
      if (!userId) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', prepareQueryId(userId))
        .single();

      if (error) {
        console.error('Error loading user balance:', error);
        return;
      }

      const typedData = castData(data, { balance: 0 });
      setUserBalance(typedData.balance || 0);
    } catch (error) {
      console.error('Error in loadUserBalance:', error);
    }
  };

  const refreshUserData = useCallback(async () => {
    if (!user?.id || refreshInProgress.current) return;
    
    refreshInProgress.current = true;
    
    try {
      const roles = await fetchUserRoles(user.id);
      setUserRoles(roles);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      await loadUserBalance(user.id);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Không thể cập nhật hồ sơ người dùng', { description: 'Vui lòng thử lại sau' });
    } finally {
      refreshInProgress.current = false;
    }
  }, [user?.id, fetchUserRoles, loadUserBalance]);

  const handleAuthStateChange = useCallback((event: string, newSession: any) => {
    console.debug(`Auth event: ${event}`);
    
    setSession(prevSession => {
      if (JSON.stringify(prevSession) !== JSON.stringify(newSession)) {
        console.debug('Session updated');
        return newSession;
      }
      return prevSession;
    });
    
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (newSession?.user) {
        const supabaseUser = newSession.user;
        const appUser = {
          ...supabaseUser,
          email: supabaseUser.email || null,
        } as User;
        
        setUser(appUser);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          setUserRoles([]);
          setTimeout(() => {
            if (newSession?.user?.id) {
              fetchUserRoles(newSession.user.id)
                .then(roles => setUserRoles(roles))
                .catch(err => console.error('Error loading roles:', err));

              loadUserBalance(newSession.user.id)
                .catch(err => console.error('Error loading balance:', err));
            }
          }, 100);
        }
      }
    } else if (event === 'SIGNED_OUT') {
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
        const supabaseUser = newSession.user;
        const appUser = {
          ...supabaseUser,
          email: supabaseUser.email || null,
        } as User;
        
        setUser(appUser);
      }
      setLoading(false);
    }
  }, [fetchUserRoles, loadUserBalance, user?.id]);

  useEffect(() => {
    if (authListenerRef.current) {
      console.log('Cleaning up existing auth listener');
      authListenerRef.current.data.subscription.unsubscribe();
      authListenerRef.current = null;
    }

    console.log('🔄 Setting up auth listener');
    
    authListenerRef.current = supabase.auth.onAuthStateChange(handleAuthStateChange);
    
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
          
          const supabaseUser = data.session.user;
          const appUser = {
            ...supabaseUser,
            email: supabaseUser.email || null,
          } as User;
          
          setUser(appUser);
          setSession(data.session);
          setHydrated(true);
          setLoading(false);
          
          setTimeout(() => {
            if (data.session?.user?.id) {
              fetchUserRoles(data.session.user.id)
                .then(roles => setUserRoles(roles))
                .catch(err => console.error('Error loading roles:', err));
              
              loadUserBalance(data.session.user.id)
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
      
      sessionCheckTimeout.current = setTimeout(() => {
        const now = Date.now();
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
  }, [handleAuthStateChange, fetchUserRoles, loadUserBalance]);

  useBalanceListener(user?.id, (newBalance) => {
    if (typeof newBalance === 'number') {
      console.log('Balance updated via listener:', newBalance);
      setUserBalance(newBalance);
    }
  });

  const refreshUserBalance = useCallback(async (): Promise<void> => {
    if (!user?.id) return;
    
    try {
      const balance = await loadUserBalance(user.id);
      setUserBalance(balance);
    } catch (error) {
      console.error('Error refreshing balance:', error);
      toast.error('Không thể cập nhật số dư', { description: 'Vui lòng thử lại sau' });
    }
  }, [user?.id, loadUserBalance]);

  const refreshBalance = useCallback(async (): Promise<void> => {
    await refreshUserBalance();
  }, [refreshUserBalance]);

  const refreshUserProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await refreshUserData();
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      toast.error('Không thể cập nhật hồ sơ người dùng', { description: 'Vui lòng thử lại sau' });
    }
  }, [user?.id, refreshUserData]);

  const login = async (email: string, password: string): Promise<void> => {
    await authLogin(email, password);
  };

  const checkUserRole = useCallback((role: UserRole): boolean => {
    return userRoles.includes(role);
  }, [userRoles]);

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

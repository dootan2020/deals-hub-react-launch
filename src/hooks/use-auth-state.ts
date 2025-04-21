import { useEffect, useState } from "react";
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: any | null;
  isInitialized: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  balance: number;
  userRoles: string[];
}

export function useAuthState() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isInitialized: false,
    isLoading: true,
    isAdmin: false,
    balance: 0,
    userRoles: [],
  });

  useEffect(() => {
    const fetchAuthState = async () => {
      setAuthState(prevState => ({ ...prevState, isLoading: true }));
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const userId = session.user.id;
          const { roles, isAdmin } = await getUserRoles(userId);
          const balance = await getUserBalance(userId);
          
          setAuthState(prevState => ({
            ...prevState,
            user: session.user,
            session: session,
            isAdmin: isAdmin,
            balance: balance,
            userRoles: roles,
          }));
        }
      } catch (error) {
        console.error("Error fetching auth state:", error);
      } finally {
        setAuthState(prevState => ({
          ...prevState,
          isInitialized: true,
          isLoading: false,
        }));
      }
    };

    fetchAuthState();

    const { subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const userId = session.user.id;
          const { roles, isAdmin } = await getUserRoles(userId);
          const balance = await getUserBalance(userId);
          
          setAuthState(prevState => ({
            ...prevState,
            user: session.user,
            session: session,
            isAdmin: isAdmin,
            balance: balance,
            userRoles: roles,
          }));
        } else {
          setAuthState(prevState => ({
            ...prevState,
            user: null,
            session: null,
            isAdmin: false,
            balance: 0,
            userRoles: [],
          }));
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const getUserRoles = async (userId: string) => {
    try {
      const { data: roles, error } = await supabase.rpc('get_user_roles', { user_id_param: userId });
      
      if (error) throw error;
      
      const isAdmin = (roles || []).includes('admin');
      
      return { roles: roles || [], isAdmin };
    } catch (error) {
      console.error('Error getting user roles:', error);
      return { roles: [], isAdmin: false };
    }
  };

  const getUserBalance = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      return data?.balance || 0;
    } catch (error) {
      console.error('Error getting user balance:', error);
      return 0;
    }
  };

  return authState;
}

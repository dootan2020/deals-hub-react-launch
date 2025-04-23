
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeId, extractSafeData } from '@/utils/supabaseHelpers';

// Define our auth state interface
interface AuthState {
  user: any;
  session: any;
  loading: boolean;
  isAuthenticated: boolean;
  balance: number | null;
}

// Initial state
const initialAuthState: AuthState = {
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  balance: null
};

export function useAuthState() {
  const [state, setState] = useState<AuthState>(initialAuthState);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Fetch user balance
  const fetchBalance = useCallback(async (userId: string) => {
    if (!userId) return null;
    
    setBalanceLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', safeId(userId))
        .single();
      
      if (error) {
        console.error('Error fetching balance:', error);
        return null;
      }
      
      const profileData = extractSafeData<{ balance: number }>(data);
      
      if (profileData) {
        return profileData.balance;
      }
      return null;
    } catch (error) {
      console.error('Error in fetchBalance:', error);
      return null;
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  // Update user and session state
  const updateAuthState = useCallback(async (session: any) => {
    if (!session) {
      setState({
        ...initialAuthState,
        loading: false
      });
      return;
    }

    try {
      const balance = await fetchBalance(session.user.id);
      
      setState({
        user: session.user,
        session,
        isAuthenticated: true,
        loading: false,
        balance
      });
    } catch (error) {
      console.error('Error updating auth state:', error);
      setState({
        ...initialAuthState,
        loading: false
      });
    }
  }, [fetchBalance]);

  // Rest of the hook implementation...
  
  return {
    ...state,
    balanceLoading,
    fetchBalance
  };
}

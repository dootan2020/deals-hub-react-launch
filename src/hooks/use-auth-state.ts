
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthState = () => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState<boolean>(false);
  
  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, sessionData) => {
        console.log('Auth state changed:', event);
        setSession(sessionData);
        setUser(sessionData?.user ?? null);
        setLoading(false);
      }
    );
    
    // Get the current session on first render
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });
    
    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user balance from the profiles table
  const fetchBalance = async (userId: string): Promise<number | null> => {
    if (!userId) return null;
    
    setBalanceLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user balance:', error);
        return null;
      }
      
      const userBalance = data?.balance || 0;
      setBalance(userBalance);
      return userBalance;
      
    } catch (error) {
      console.error('Error in fetchBalance:', error);
      return null;
    } finally {
      setBalanceLoading(false);
    }
  };

  // Fetch balance when user changes
  useEffect(() => {
    if (user?.id) {
      fetchBalance(user.id);
    } else {
      setBalance(null);
    }
  }, [user]);

  return {
    session,
    user,
    loading,
    isAuthenticated: !!user,
    balance,
    balanceLoading,
    fetchBalance
  };
};

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeId, extractSafeData } from '@/utils/supabaseHelpers';

interface UseCachedBalanceOptions {
  userId?: string;
  initialRefresh?: boolean;
  strategy?: 'auto' | 'manual';
  refreshInterval?: number;
  cacheTime?: number;
}

export function useCachedBalance({
  userId,
  initialRefresh = true,
  strategy = 'auto',
  refreshInterval = 30000, // 30 seconds
  cacheTime = 10000 // 10 seconds
}: UseCachedBalanceOptions = {}) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(initialRefresh);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  
  // Fetch balance from API
  const fetchBalance = useCallback(async () => {
    if (!userId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', safeId(userId))
        .maybeSingle();
      
      if (error) throw new Error(error.message);
      
      const profileData = extractSafeData<{balance: number}>(data);
      
      if (profileData && profileData.balance !== undefined) {
        const newBalance = Number(profileData.balance);
        setBalance(newBalance);
        setLastRefreshed(new Date());
        return newBalance;
      }
      
      throw new Error('Balance data not available');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch balance';
      console.error('Error fetching balance:', errorMsg);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  // Function to invalidate cache and force refresh
  const refreshBalance = useCallback(() => {
    return fetchBalance();
  }, [fetchBalance]);
  
  // Set up realtime subscription for balance changes
  useEffect(() => {
    if (!userId) return;
    
    // Fetch on mount if initialRefresh is true
    if (initialRefresh) {
      fetchBalance();
    }
    
    // Set up realtime subscription to profiles table
    const channel = supabase
      .channel('profile-balance-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => {
          console.log('Profile realtime update:', payload);
          if (payload.new && 'balance' in payload.new && typeof payload.new.balance === 'number') {
            setBalance(payload.new.balance);
            setLastRefreshed(Date.now());
          }
        }
      )
      .subscribe((status) => {
        console.log('Profile balance subscription status:', status);
        
        if (status !== 'SUBSCRIBED') {
          console.warn('Failed to subscribe to profile updates, falling back to polling');
        }
      });
    
    // Set up auto-refresh interval if strategy is 'auto'
    let intervalId: number | undefined;
    if (strategy === 'auto' && refreshInterval > 0) {
      intervalId = window.setInterval(() => {
        console.log('Auto-refreshing balance');
        fetchBalance();
      }, refreshInterval);
    }
    
    // Clean up on unmount
    return () => {
      supabase.removeChannel(channel);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [userId, fetchBalance, initialRefresh, refreshInterval, strategy]);
  
  return {
    balance,
    loading,
    error,
    refreshBalance,
    lastRefreshed: lastRefreshed ? new Date(lastRefreshed) : null
  };
}

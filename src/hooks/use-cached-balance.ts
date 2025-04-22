
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type RefreshStrategy = 'auto' | 'manual';

interface UseCachedBalanceOptions {
  userId?: string;
  refreshInterval?: number; // in milliseconds
  initialRefresh?: boolean;
  strategy?: RefreshStrategy;
  cacheTime?: number; // in milliseconds
}

export function useCachedBalance({
  userId,
  refreshInterval = 30000,
  initialRefresh = true,
  strategy = 'auto',
  cacheTime = 60000 // 1 minute cache by default
}: UseCachedBalanceOptions = {}) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<number | null>(null);

  // Function to fetch balance from Supabase
  const fetchBalance = useCallback(async (forceRefresh = false) => {
    if (!userId) {
      console.warn('Tried to fetch balance but no userId provided');
      return;
    }
    
    // Check if we need to use cache
    const now = Date.now();
    if (!forceRefresh && lastRefreshed && (now - lastRefreshed < cacheTime)) {
      console.log('Using cached balance from', new Date(lastRefreshed).toLocaleTimeString());
      return; // Use cached data
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // First try with direct profile query
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching balance:', fetchError);
        throw fetchError;
      }
      
      if (data && typeof data.balance === 'number') {
        console.log('Balance fetched successfully:', data.balance);
        setBalance(data.balance);
        setLastRefreshed(now);
      } else {
        throw new Error('Invalid balance data received');
      }
    } catch (err) {
      console.error('Exception in fetchBalance:', err);
      setError('Failed to fetch balance');
      
      // Try to recover by using refresh-balance function
      try {
        console.log('Attempting to recover using refresh-balance function');
        // Get current session token
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        
        if (!accessToken) {
          throw new Error('No active session found');
        }
        
        const { data: refreshData, error: refreshError } = await supabase.functions.invoke('refresh-balance', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        if (refreshError) {
          console.error('Edge function refresh error:', refreshError);
        } else if (refreshData && typeof refreshData.balance === 'number') {
          console.log('Balance refreshed from edge function:', refreshData.balance);
          setBalance(refreshData.balance);
          setLastRefreshed(now);
          setError(null); // Clear error since we recovered
        }
      } catch (recoverError) {
        console.error('Failed to recover balance:', recoverError);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, lastRefreshed, cacheTime]);

  // Function to invalidate cache and force refresh
  const refreshBalance = useCallback(() => {
    return fetchBalance(true);
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

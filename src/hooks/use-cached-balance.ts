
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { prepareQueryParam } from '@/utils/supabaseTypeUtils';
import { extractSafeData } from '@/utils/supabaseHelpers';

const CACHE_TIME = 60 * 1000; // 1 minute in milliseconds

export const useCachedBalance = (userId: string | undefined) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date>(new Date(0)); // Initialize with old date
  
  const isCacheStale = useCallback(() => {
    const now = new Date();
    const timeDiff = now.getTime() - lastFetched.getTime();
    return timeDiff > CACHE_TIME;
  }, [lastFetched]);
  
  const fetchBalance = useCallback(async (forceRefresh: boolean = false) => {
    if (!userId) return;
    
    // Return cached balance if it's available and not stale
    if (!forceRefresh && balance !== null && !isCacheStale()) {
      return balance;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        throw new Error(error.message);
      }
      
      const profileData = extractSafeData<{ balance: number }>(data);
      
      if (profileData) {
        setBalance(profileData.balance);
        setLastFetched(new Date()); // Set the current time as the last fetch time
        return profileData.balance;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, balance, isCacheStale]);
  
  const refreshBalance = useCallback(async () => {
    return fetchBalance(true);
  }, [fetchBalance]);
  
  useEffect(() => {
    if (userId) {
      // Only fetch on initial render or if userId changes
      fetchBalance();
    } else {
      // Reset balance if userId is not provided
      setBalance(null);
    }
    
    // Setup real-time listener for balance updates
    if (userId) {
      const channel = supabase
        .channel('profile-balance-changes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        }, (payload) => {
          const newBalance = payload.new?.balance;
          if (newBalance !== undefined) {
            setBalance(Number(newBalance));
            setLastFetched(new Date());
          }
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId, fetchBalance]);
  
  return {
    balance,
    loading,
    refreshBalance,
    fetchBalance
  };
};


import { useState, useEffect } from 'react';
import { useCachedBalance } from './use-cached-balance';

interface UsePurchaseResourcesOptions {
  userId?: string;
  initialRefresh?: boolean;
  strategy?: 'cache-first' | 'network-first';
  refreshInterval?: number;
  cacheTime?: number;
}

export const usePurchaseResources = (options: UsePurchaseResourcesOptions = {}) => {
  const {
    userId,
    initialRefresh = true,
    strategy = 'cache-first',
    refreshInterval = 60000, // 1 minute
    cacheTime = 300000 // 5 minutes
  } = options;
  
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [error, setError] = useState<Error | null>(null);
  
  // Use the cached balance hook
  const { 
    balance, 
    loading, 
    refreshBalance, 
    fetchBalance 
  } = useCachedBalance(userId);
  
  // Force refresh on mount if requested
  useEffect(() => {
    if (initialRefresh && userId) {
      refreshBalance().catch(err => {
        console.error('Error refreshing balance on mount:', err);
        setError(err instanceof Error ? err : new Error('Failed to refresh balance'));
      });
    }
  }, [initialRefresh, userId, refreshBalance]);
  
  // Set up auto-refresh interval if specified
  useEffect(() => {
    if (!refreshInterval || !userId) return;
    
    const intervalId = setInterval(() => {
      const now = new Date();
      const timeSinceLastRefresh = now.getTime() - lastRefreshed.getTime();
      
      // Only refresh if cache is stale
      if (timeSinceLastRefresh > cacheTime) {
        refreshBalance()
          .then(() => setLastRefreshed(new Date()))
          .catch(err => {
            console.error('Error auto-refreshing balance:', err);
          });
      }
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [userId, refreshInterval, cacheTime, lastRefreshed, refreshBalance]);
  
  return {
    balance,
    loading,
    error,
    refreshBalance,
    fetchBalance,
    lastRefreshed
  };
};

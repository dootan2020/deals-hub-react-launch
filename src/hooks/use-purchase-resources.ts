
import { useCallback, useState, useEffect } from 'react';
import { useCachedBalance } from './use-cached-balance';
import { useProductStock } from './use-product-stock';
import { useAuth } from '@/context/AuthContext';

interface UsePurchaseResourcesOptions {
  kioskToken?: string;
  initialFetch?: boolean;
}

/**
 * Combined hook for efficiently managing both product stock and user balance
 * during purchase workflows, with parallel fetching and optimized caching.
 */
export function usePurchaseResources({
  kioskToken,
  initialFetch = true,
}: UsePurchaseResourcesOptions = {}) {
  const { user } = useAuth();
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  
  // Use our optimized cache hooks
  const { 
    balance, 
    loading: balanceLoading, 
    error: balanceError, 
    refreshBalance,
    lastRefreshed: balanceLastRefreshed
  } = useCachedBalance({ 
    userId: user?.id,
    initialRefresh: initialFetch && !!user?.id,
    strategy: 'auto',
    refreshInterval: 60000, // 1 minute
    cacheTime: 30000 // 30 seconds
  });
  
  const {
    stockInfo,
    loading: stockLoading,
    error: stockError,
    refreshStock,
    lastFetched: stockLastRefreshed
  } = useProductStock({
    kioskToken,
    initialFetch: initialFetch && !!kioskToken,
    cacheDuration: 30000, // 30 seconds
    retryOnError: true
  });
  
  // Function to refresh both resources in parallel
  const refreshResources = useCallback(async () => {
    if (!user?.id && !kioskToken) {
      console.warn('Cannot refresh resources: missing user ID or kiosk token');
      return false;
    }
    
    setHasAttemptedFetch(true);
    const promises: Promise<any>[] = [];
    
    // Only attempt to refresh balance if we have a user ID
    if (refreshBalance && user?.id) {
      promises.push(refreshBalance().catch(err => {
        console.error('Error refreshing balance:', err);
        return null;
      }));
    }
    
    // Only attempt to refresh stock if we have a kiosk token
    if (refreshStock && kioskToken) {
      promises.push(refreshStock().catch(err => {
        console.error('Error refreshing stock:', err);
        return null;
      }));
    }
    
    // If we have no promises to execute, return early
    if (promises.length === 0) {
      return false;
    }
    
    try {
      const results = await Promise.allSettled(promises);
      // Check if at least one promise succeeded
      return results.some(result => result.status === 'fulfilled' && result.value !== null);
    } catch (error) {
      console.error('Error refreshing resources:', error);
      return false;
    }
  }, [refreshBalance, refreshStock, user?.id, kioskToken]);
  
  // Run initial fetch on mount or when dependencies change
  useEffect(() => {
    if (initialFetch && !hasAttemptedFetch && (user?.id || kioskToken)) {
      refreshResources();
    }
  }, [initialFetch, user?.id, kioskToken, hasAttemptedFetch, refreshResources]);
  
  // Check if user can afford product
  const canPurchase = useCallback(() => {
    if (balance === null || !stockInfo || stockInfo.price === undefined) return false;
    return balance >= stockInfo.price && (stockInfo.stock || 0) > 0;
  }, [balance, stockInfo]);

  return {
    // Balance data
    balance,
    balanceLoading,
    balanceError,
    refreshBalance,
    balanceLastRefreshed,
    
    // Stock data
    stock: stockInfo?.stock || 0,
    price: stockInfo?.price || 0,
    productName: stockInfo?.name,
    stockLoading,
    stockError,
    refreshStock,
    stockLastRefreshed,
    
    // Combined functionality
    loading: balanceLoading || stockLoading,
    hasError: !!balanceError || !!stockError,
    refreshAll: refreshResources,
    canPurchase: canPurchase(),
    
    // Additional info
    missingFunds: stockInfo?.price ? Math.max(0, stockInfo.price - (balance || 0)) : 0,
    isInStock: (stockInfo?.stock || 0) > 0,
    
    // Debug info
    hasAttemptedFetch
  };
}

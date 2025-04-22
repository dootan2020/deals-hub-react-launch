
import { useCallback } from 'react';
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
  
  // Use our optimized cache hooks
  const { 
    balance, 
    loading: balanceLoading, 
    error: balanceError, 
    refreshBalance,
    lastRefreshed: balanceLastRefreshed
  } = useCachedBalance({ 
    userId: user?.id,
    initialRefresh: initialFetch,
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
    initialFetch,
    cacheDuration: 30000, // 30 seconds
    retryOnError: true
  });
  
  // Function to refresh both resources in parallel
  const refreshResources = useCallback(async () => {
    return Promise.all([
      refreshBalance(),
      refreshStock()
    ]);
  }, [refreshBalance, refreshStock]);
  
  // Check if user can afford product
  const canPurchase = useCallback(() => {
    if (!balance || !stockInfo || !stockInfo.price) return false;
    return balance >= stockInfo.price && stockInfo.stock > 0;
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
    isInStock: (stockInfo?.stock || 0) > 0
  };
}

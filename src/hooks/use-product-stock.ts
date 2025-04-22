
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProductStock {
  stock: number;
  price: number;
  name: string;
}

interface UseProductStockOptions {
  kioskToken?: string;
  initialFetch?: boolean;
  cacheDuration?: number;
  retryOnError?: boolean;
  maxRetries?: number;
}

export function useProductStock({
  kioskToken,
  initialFetch = true,
  cacheDuration = 60000, // 1 minute cache
  retryOnError = true,
  maxRetries = 3
}: UseProductStockOptions = {}) {
  const [stockInfo, setStockInfo] = useState<ProductStock | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  // Fetch stock information from API
  const fetchStock = useCallback(async (force = false) => {
    if (!kioskToken) return;
    
    // Use cache if available and not forcing refresh
    if (!force && lastFetched && Date.now() - lastFetched < cacheDuration) {
      console.log(`Using cached stock for ${kioskToken} from ${new Date(lastFetched).toLocaleTimeString()}`);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching stock for kioskToken: ${kioskToken}`);
      
      // Use our edge function to fetch stock to avoid CORS issues
      const { data, error } = await supabase.functions.invoke('api-proxy', {
        body: {
          kioskToken,
          userToken: localStorage.getItem('taphoammo_token') || '', // Fallback to empty if not set
          endpoint: 'getStock'
        }
      });
      
      if (error) throw new Error(`API proxy error: ${error.message}`);
      
      if (!data || data.success !== 'true') {
        throw new Error(`Failed to fetch stock: ${data?.error || 'Unknown error'}`);
      }
      
      // Parse response data
      const stock = parseInt(data.stock || '0', 10);
      const price = parseFloat(data.price || '0');
      
      setStockInfo({
        stock,
        price,
        name: data.name || 'Unknown Product'
      });
      setLastFetched(Date.now());
      setRetryCount(0); // Reset retry counter on success
      
    } catch (err) {
      console.error(`Error fetching stock for ${kioskToken}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Handle retries if enabled
      if (retryOnError && retryCount < maxRetries) {
        const nextRetry = retryCount + 1;
        setRetryCount(nextRetry);
        
        const retryDelay = Math.min(1000 * Math.pow(2, nextRetry), 10000); // Exponential backoff
        console.log(`Retrying in ${retryDelay}ms (attempt ${nextRetry})`);
        
        setTimeout(() => {
          fetchStock(true);
        }, retryDelay);
      }
    } finally {
      setLoading(false);
    }
  }, [kioskToken, lastFetched, cacheDuration, retryCount, retryOnError, maxRetries]);

  // Force refresh stock data
  const refreshStock = useCallback(() => {
    return fetchStock(true);
  }, [fetchStock]);

  // Initial fetch on mount
  useEffect(() => {
    if (initialFetch && kioskToken) {
      fetchStock();
    }
    
    // Set up realtime listener for product updates
    if (kioskToken) {
      const channel = supabase
        .channel('product-stock-changes')
        .on(
          'postgres_changes',
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'products', 
            filter: `kiosk_token=eq.${kioskToken}` 
          },
          (payload) => {
            console.log('Product realtime update:', payload);
            if (payload.new) {
              const product = payload.new as any;
              if ('api_stock' in product || 'api_price' in product) {
                setStockInfo(prev => ({
                  stock: product.api_stock !== undefined ? product.api_stock : (prev?.stock || 0),
                  price: product.api_price !== undefined ? product.api_price : (prev?.price || 0),
                  name: product.api_name || product.title || (prev?.name || 'Unknown')
                }));
                setLastFetched(Date.now());
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('Product stock subscription status:', status);
        });
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [kioskToken, initialFetch, fetchStock]);

  return {
    stockInfo,
    loading,
    error,
    refreshStock,
    lastFetched: lastFetched ? new Date(lastFetched) : null
  };
}

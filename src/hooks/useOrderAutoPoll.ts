
import { useState, useEffect, useCallback, useRef } from 'react';
import { useOrderApi } from '@/hooks/use-order-api';
import { toast } from '@/hooks/use-toast';

interface UseOrderAutoPollProps {
  orderId: string | null;
  initialDelay?: number;
  maxRetries?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onProcessing?: (data: any) => void;
  onError?: (error: any) => void;
}

/**
 * Hook to automatically poll an order status until completion or max retries
 */
export const useOrderAutoPoll = ({
  orderId,
  initialDelay = 2000,
  maxRetries = 10, 
  retryDelay = 5000,
  onSuccess,
  onProcessing,
  onError
}: UseOrderAutoPollProps) => {
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retries, setRetries] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<number | null>(null);
  
  const { checkOrder } = useOrderApi();
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  // Reset state when order ID changes
  useEffect(() => {
    if (orderId) {
      setRetries(0);
      setError(null);
      setIsComplete(false);
      setOrderData(null);
    }
  }, [orderId]);
  
  const fetchOrderStatus = useCallback(async () => {
    if (!orderId || isComplete) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Polling order: ${orderId} (attempt: ${retries + 1}/${maxRetries})`);
      const result = await checkOrder({ orderId });
      setOrderData(result);
      
      if (result.success === 'true' && result.data) {
        setIsComplete(true);
        if (onSuccess) onSuccess(result);
        return; // Completed successfully
      }
      
      // Order still processing
      if (result.description === 'Order in processing!') {
        if (onProcessing) onProcessing(result);
        
        if (retries < maxRetries) {
          // Schedule next retry
          timerRef.current = window.setTimeout(() => {
            setRetries(prev => prev + 1);
            fetchOrderStatus();
          }, retryDelay);
        } else {
          setError(`Đã thử lại tối đa ${maxRetries} lần. Xin hãy kiểm tra lại sau.`);
          if (onError) onError({ message: `Max retries (${maxRetries}) reached` });
        }
      } else {
        // Some other error state
        setError(result.description || 'Lỗi không xác định khi kiểm tra đơn hàng');
        if (onError) onError(result);
      }
    } catch (err: any) {
      console.error('Error polling order:', err);
      setError(err.message || 'Có lỗi xảy ra khi kiểm tra đơn hàng');
      if (onError) onError(err);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, retries, maxRetries, retryDelay, checkOrder, isComplete, onSuccess, onProcessing, onError]);
  
  // Start polling after initial delay when order ID is available
  useEffect(() => {
    if (orderId && !isComplete) {
      timerRef.current = window.setTimeout(() => {
        fetchOrderStatus();
      }, initialDelay);
    }
  }, [orderId, fetchOrderStatus, initialDelay, isComplete]);
  
  // Force manual refresh
  const manualRefresh = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setRetries(prev => prev + 1);
    fetchOrderStatus();
  };
  
  return {
    orderData,
    isLoading,
    error,
    retries,
    maxRetries,
    isComplete,
    manualRefresh,
  };
};

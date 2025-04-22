
import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

interface AccountData {
  totalDeposited: number;
  totalOrders: number;
  lastLoginAt: Date | null;
}

interface CacheData extends AccountData {
  timestamp: number;
}

export const useAccountData = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AccountData>({
    totalDeposited: 0,
    totalOrders: 0,
    lastLoginAt: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const isMounted = useRef(true);

  const getCachedData = useCallback(() => {
    const cached = localStorage.getItem(`account_data_${user?.id}`);
    if (cached) {
      const parsedCache: CacheData = JSON.parse(cached);
      if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
        delete parsedCache.timestamp;
        return parsedCache as AccountData;
      }
    }
    return null;
  }, [user?.id]);

  const cacheData = useCallback((data: AccountData) => {
    const cacheData: CacheData = {
      ...data,
      timestamp: Date.now()
    };
    localStorage.setItem(`account_data_${user?.id}`, JSON.stringify(cacheData));
  }, [user?.id]);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError('');

    try {
      // Check cache first
      const cachedData = getCachedData();
      if (cachedData) {
        if (isMounted.current) {
          setData(cachedData);
          setIsLoading(false);
        }
        return;
      }

      // Fetch fresh data in parallel
      const [depositData, orderData, authData] = await Promise.all([
        supabase
          .from('deposits')
          .select('amount')
          .eq('user_id', user.id)
          .eq('status', 'completed'),
        
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        
        supabase.auth.getSession()
      ]);

      if (!isMounted.current) return;

      const newData: AccountData = {
        totalDeposited: depositData.data?.reduce((total, item) => 
          total + Number(item.amount), 0) || 0,
        totalOrders: orderData.count || 0,
        lastLoginAt: authData?.data?.session?.user?.last_sign_in_at 
          ? new Date(authData.data.session.user.last_sign_in_at)
          : null
      };

      setData(newData);
      cacheData(newData);
    } catch (error) {
      console.error("Error fetching account data:", error);
      if (isMounted.current) {
        setError('Failed to load account data');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user?.id, getCachedData, cacheData]);

  useEffect(() => {
    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  return {
    ...data,
    isLoading,
    error,
    refetch: fetchData
  };
};

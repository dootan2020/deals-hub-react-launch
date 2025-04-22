
import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { getCachedData, setCachedData, CACHE_KEYS, TTL } from '@/utils/cacheUtils';

interface AccountData {
  totalDeposited: number;
  totalOrders: number;
  lastLoginAt: Date | null;
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

  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError('');

    try {
      // Check cache first
      const cached = getCachedData<AccountData>(
        `${CACHE_KEYS.USER_PROFILE}_${user.id}`,
        { ttl: TTL.PROFILE }
      );
      
      if (cached) {
        if (isMounted.current) {
          setData(cached);
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
      setCachedData(`${CACHE_KEYS.USER_PROFILE}_${user.id}`, newData, TTL.PROFILE);
      
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
  }, [user?.id]);

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

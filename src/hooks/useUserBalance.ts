
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useUserBalance = () => {
  const { user } = useAuth();
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!user?.id) {
      setUserBalance(0);
      return 0;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (error) throw new Error(error.message);
      
      const balance = data?.balance || 0;
      setUserBalance(balance);
      return balance;
    } catch (err: any) {
      console.error('Error fetching user balance:', err);
      setError(err);
      return 0;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    userBalance,
    isLoading,
    error,
    fetchBalance,
    setUserBalance
  };
};

export default useUserBalance;


import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeExtractProperty, safeDatabaseData } from '@/utils/supabaseTypeUtils';

export const useBalanceListener = (userId: string | undefined) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  const fetchUserBalance = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', safeDatabaseData(userId))
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching balance:', error);
      } else {
        // Use the safe extract function
        setBalance(safeExtractProperty<number>(data, 'balance', 0));
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  useEffect(() => {
    fetchUserBalance();
  }, [fetchUserBalance, userId]);
  
  return { balance, loading, fetchUserBalance };
};

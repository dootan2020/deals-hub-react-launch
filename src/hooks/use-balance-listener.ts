
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeId, extractSafeData } from '@/utils/supabaseHelpers';

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
        .eq('id', safeId(userId))
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching balance:', error);
      } else {
        const profileData = extractSafeData<{ balance: number }>(data);
        if (profileData) {
          setBalance(profileData.balance);
        }
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

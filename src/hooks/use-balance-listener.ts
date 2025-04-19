
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBalanceListener = (userId: string | undefined, onBalanceUpdate: (balance: number) => void) => {
  useEffect(() => {
    if (!userId) return;

    // Listen for profile updates (balance changes)
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => {
          console.log('Profile balance updated:', payload);
          if (payload.new && 'balance' in payload.new) {
            onBalanceUpdate(payload.new.balance as number);
          }
        }
      )
      .subscribe();

    // Also listen for deposit status changes
    const depositsChannel = supabase
      .channel('deposit-status-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'deposits', filter: `user_id=eq.${userId}` },
        (payload) => {
          console.log('Deposit status changed:', payload);
          // When a deposit is updated and it has a transaction_id, refresh the balance
          if (payload.new && payload.new.transaction_id && payload.old?.status !== 'completed' && payload.new.status === 'completed') {
            console.log('Deposit completed, refreshing balance');
            // Fetch the latest balance
            supabase
              .from('profiles')
              .select('balance')
              .eq('id', userId)
              .single()
              .then(({ data }) => {
                if (data && 'balance' in data) {
                  onBalanceUpdate(data.balance);
                }
              });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(depositsChannel);
    };
  }, [userId, onBalanceUpdate]);
};

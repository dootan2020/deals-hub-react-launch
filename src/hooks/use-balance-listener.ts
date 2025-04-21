
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBalanceListener = (userId: string | undefined, onBalanceUpdate: (balance: number) => void) => {
  useEffect(() => {
    if (!userId) return;

    // Define a function to fetch the current balance
    const fetchCurrentBalance = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.error('Error fetching balance:', error);
          return;
        }
        
        if (data && 'balance' in data) {
          console.log('Manually fetched current balance:', data.balance);
          onBalanceUpdate(data.balance);
        }
      } catch (err) {
        console.error('Exception in fetchCurrentBalance:', err);
      }
    };

    // Call once immediately to ensure we have the latest balance
    fetchCurrentBalance();

    // Listen for profile updates (balance changes)
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => {
          console.log('Profile balance updated via realtime:', payload);
          if (payload.new && 'balance' in payload.new) {
            onBalanceUpdate(payload.new.balance as number);
          }
        }
      )
      .subscribe((status) => {
        console.log('Profile changes subscription status:', status);
        
        // If subscription fails, fallback to periodic polling
        if (status !== 'SUBSCRIBED') {
          console.warn('Realtime subscription failed, falling back to polling');
        }
      });

    // Also listen for deposit status changes
    const depositsChannel = supabase
      .channel('deposit-status-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'deposits', filter: `user_id=eq.${userId}` },
        (payload) => {
          console.log('Deposit status changed:', payload);
          // When a deposit is updated and it has a transaction_id, refresh the balance
          if (payload.new && payload.new.transaction_id && 
              (payload.old?.status !== 'completed' && payload.new.status === 'completed')) {
            console.log('Deposit completed, refreshing balance');
            fetchCurrentBalance();
          }
        }
      )
      .subscribe((status) => {
        console.log('Deposits channel subscription status:', status);
      });

    // Transaction changes should also trigger a balance update
    const transactionsChannel = supabase
      .channel('transaction-status-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` },
        (payload) => {
          console.log('New transaction detected:', payload);
          fetchCurrentBalance();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` },
        (payload) => {
          console.log('Transaction status updated:', payload);
          fetchCurrentBalance();
        }
      )
      .subscribe((status) => {
        console.log('Transactions channel subscription status:', status);
      });

    // Set up a fallback periodic polling mechanism (every 10 seconds)
    const pollingInterval = setInterval(() => {
      console.log('Polling for balance updates');
      fetchCurrentBalance();
    }, 10000); // 10 seconds

    return () => {
      // Clean up all subscriptions and intervals
      supabase.removeChannel(channel);
      supabase.removeChannel(depositsChannel);
      supabase.removeChannel(transactionsChannel);
      clearInterval(pollingInterval);
    };
  }, [userId, onBalanceUpdate]);
};

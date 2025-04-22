
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBalanceListener = (userId: string | undefined, onBalanceUpdate: (balance: number) => void) => {
  const lastUpdatedRef = useRef<number>(Date.now());
  const subscriptionAttemptsRef = useRef<number>(0);
  const isPollingRef = useRef<boolean>(false);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  useEffect(() => {
    if (!userId) return;
    
    let channelSubscribed = false;
    
    // Define a function to fetch the current balance with caching
    const fetchCurrentBalance = async () => {
      try {
        // Check if we've updated recently (within 10 seconds) to avoid excessive fetching
        const timeSinceLastUpdate = Date.now() - lastUpdatedRef.current;
        if (timeSinceLastUpdate < 10000) {
          console.debug('Skipping balance update - updated recently');
          return;
        }
        
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
          console.log('Fetched current balance:', data.balance);
          onBalanceUpdate(data.balance);
          lastUpdatedRef.current = Date.now();
        }
      } catch (err) {
        console.error('Exception in fetchCurrentBalance:', err);
      }
    };

    // Setup polling mechanism with exponential backoff
    const setupPolling = () => {
      if (isPollingRef.current) return; // Prevent multiple polling loops
      
      isPollingRef.current = true;
      
      // Clear any existing interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      // Calculate polling interval with exponential backoff
      // Starting at 10s, max 60s
      const attempts = Math.min(subscriptionAttemptsRef.current, 5);
      const pollInterval = Math.min(10000 * (2 ** attempts), 60000);
      
      console.log(`Setting up polling with interval: ${pollInterval}ms`);
      
      pollingIntervalRef.current = setInterval(() => {
        console.debug('Polling for balance updates');
        fetchCurrentBalance();
      }, pollInterval);
    };

    // Call once immediately to ensure we have the latest balance
    fetchCurrentBalance();
    
    // Setup realtime subscription with retry logic
    const setupRealtimeSubscription = () => {
      try {
        // Only try subscription if attempts are below threshold
        if (subscriptionAttemptsRef.current < 3) {
          const channel = supabase
            .channel(`profile-changes-${subscriptionAttemptsRef.current}`) // Add attempt count to channel name
            .on(
              'postgres_changes',
              { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
              (payload) => {
                console.log('Profile balance updated via realtime:', payload);
                if (payload.new && 'balance' in payload.new) {
                  onBalanceUpdate(payload.new.balance as number);
                  lastUpdatedRef.current = Date.now(); // Update the timestamp
                }
              }
            )
            .subscribe((status) => {
              console.log('Profile changes subscription status:', status);
              
              if (status === 'SUBSCRIBED') {
                channelSubscribed = true;
                // Reduce polling frequency when we have a subscription
                if (pollingIntervalRef.current) {
                  clearInterval(pollingIntervalRef.current);
                  pollingIntervalRef.current = setInterval(fetchCurrentBalance, 60000); // 60s as backup
                }
              } else {
                channelSubscribed = false;
                subscriptionAttemptsRef.current++;
                
                // If subscription fails, fall back to more frequent polling
                console.warn('Realtime subscription failed, falling back to polling');
                setupPolling();
                
                // Try to resubscribe after a delay if we haven't exceeded attempts
                if (subscriptionAttemptsRef.current < 3) {
                  setTimeout(() => {
                    console.log('Attempting to resubscribe to realtime updates...');
                    supabase.removeChannel(channel);
                    setupRealtimeSubscription();
                  }, 5000 * subscriptionAttemptsRef.current);
                }
              }
            });
          
          return channel;
        }
        return null;
      } catch (err) {
        console.error('Failed to set up realtime subscription:', err);
        return null;
      }
    };
    
    // Start with realtime subscription attempt
    const channel = setupRealtimeSubscription();
    
    // Set up an infrequent polling as a fallback even if realtime works
    setupPolling();
    
    // Set up more focused listeners for critical events
    
    // Transaction changes should also trigger a balance update
    const transactionsChannel = supabase
      .channel('transaction-important-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` },
        () => {
          console.log('New transaction detected, updating balance');
          fetchCurrentBalance();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId} AND status=eq.completed` },
        () => {
          console.log('Transaction completed, updating balance');
          fetchCurrentBalance();
        }
      )
      .subscribe();

    return () => {
      // Clean up all subscriptions and intervals
      if (channel) supabase.removeChannel(channel);
      supabase.removeChannel(transactionsChannel);
      
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      isPollingRef.current = false;
    };
  }, [userId, onBalanceUpdate]);
};

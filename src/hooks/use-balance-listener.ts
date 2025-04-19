
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBalanceListener = (userId: string | undefined, onBalanceUpdate: (balance: number) => void) => {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => {
          console.log('Profile updated:', payload);
          if (payload.new && 'balance' in payload.new) {
            onBalanceUpdate(payload.new.balance as number);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onBalanceUpdate]);
};

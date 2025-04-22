
import { useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useSessionMonitoring = (session: Session | null) => {
  useEffect(() => {
    if (!session?.expires_at) return;
    
    const checkExpiryInterval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at;
      const timeUntilExpiry = expiresAt - now;
      
      if (timeUntilExpiry > 0 && timeUntilExpiry < 300) {
        console.log(`Session expires in ${timeUntilExpiry} seconds, refreshing...`);
        supabase.auth.refreshSession()
          .then(({ data, error }) => {
            if (error) {
              console.error('Failed to refresh session:', error);
            } else if (data.session) {
              console.log('Session refreshed, new expiry:',
                new Date(data.session.expires_at * 1000).toLocaleString());
            }
          });
      }
    }, 60000);
    
    return () => clearInterval(checkExpiryInterval);
  }, [session]);
};

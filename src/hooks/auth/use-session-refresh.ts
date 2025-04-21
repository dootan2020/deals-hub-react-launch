
import { useEffect, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useSessionRefresh = (session: Session | null) => {
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (session?.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at;
      const timeUntilExpiry = expiresAt - now;
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      if (timeUntilExpiry < 300) {
        console.log("Session expires soon, refreshing now...");
        supabase.auth.refreshSession();
      }
      else if (timeUntilExpiry > 360) {
        const refreshDelay = (timeUntilExpiry - 300) * 1000;
        console.log(`Scheduling session refresh in ${Math.floor(refreshDelay/60000)} minutes`);
        
        refreshTimeoutRef.current = setTimeout(() => {
          console.log("Executing scheduled session refresh");
          supabase.auth.refreshSession()
            .then(({ data, error }) => {
              if (error) {
                console.error("Failed to refresh session:", error);
              } else if (data.session) {
                console.log("Session refreshed successfully, new expiry:", 
                  new Date(data.session.expires_at * 1000).toLocaleString());
              }
            });
        }, refreshDelay);
      }
    }
    
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [session?.expires_at]);
};

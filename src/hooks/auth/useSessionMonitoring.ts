import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to monitor session expiry and refresh when needed
 */
export const useSessionMonitoring = (session: any) => {
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Clear any existing refresh timeouts when session changes
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    
    if (!session?.expires_at) return;
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at;
    const timeUntilExpiry = expiresAt - now;
    
    // If session expires in less than 5 minutes, refresh it now
    if (timeUntilExpiry < 300) {
      console.log('Session expires soon, refreshing now...');
      supabase.auth.refreshSession();
      return;
    }
    
    // Otherwise schedule a refresh for 5 minutes before expiry
    const refreshDelay = (timeUntilExpiry - 300) * 1000;
    console.log(`Scheduling session refresh in ${Math.floor(refreshDelay/60000)} minutes`);
    
    refreshTimeoutRef.current = setTimeout(() => {
      console.log('Executing scheduled session refresh');
      supabase.auth.refreshSession()
        .then(({ data, error }) => {
          if (error) {
            console.error('Failed to refresh session:', error);
          } else if (data.session) {
            console.log('Session refreshed successfully, new expiry:', 
              new Date(data.session.expires_at * 1000).toLocaleString());
          }
        });
    }, refreshDelay);
    
    // Also set up a monitoring interval to check session status periodically
    const monitorInterval = setInterval(() => {
      if (!session?.expires_at) return;
      
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = session.expires_at - currentTime;
      
      if (remainingTime < 0) {
        console.warn('Session has expired but not refreshed!');
        // Try emergency refresh
        supabase.auth.refreshSession().catch(err => {
          console.error('Emergency session refresh failed:', err);
        });
      }
    }, 60000); // Check every minute
    
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      clearInterval(monitorInterval);
    };
  }, [session?.expires_at]);
};

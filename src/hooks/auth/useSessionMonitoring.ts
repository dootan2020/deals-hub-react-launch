
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSessionMonitoring = (onOffline?: () => void, onOnline?: () => void) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      onOnline?.();
    };

    const handleOffline = () => {
      setIsOnline(false);
      onOffline?.();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onOffline, onOnline]);

  const monitorSession = (session: any) => {
    if (!session?.expires_at) return;

    // Clear any existing monitoring
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at;
    const timeUntilExpiry = expiresAt - now;

    // If session expires in less than 5 minutes and we're online, refresh it now
    if (timeUntilExpiry < 300 && isOnline) {
      console.log('Session expires soon, refreshing now...');
      supabase.auth.refreshSession();
      return;
    }

    // Schedule refresh for 5 minutes before expiry if we're online
    if (isOnline) {
      const refreshDelay = (timeUntilExpiry - 300) * 1000;
      console.log(`Scheduling session refresh in ${Math.floor(refreshDelay/60000)} minutes`);

      refreshTimeoutRef.current = setTimeout(() => {
        if (!isOnline) {
          toast.error('Unable to refresh session - offline');
          return;
        }

        console.log('Executing scheduled session refresh');
        supabase.auth.refreshSession()
          .then(({ data, error }) => {
            if (error) {
              console.error('Failed to refresh session:', error);
              toast.error('Failed to refresh session');
            } else if (data.session) {
              console.log('Session refreshed successfully');
            }
          });
      }, refreshDelay);
    }
  };

  // Cleanup function
  const cleanup = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  };

  return {
    monitorSession,
    cleanup,
    isOnline
  };
};

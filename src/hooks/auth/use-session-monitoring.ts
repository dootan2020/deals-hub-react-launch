import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSessionMonitoring = (session: any) => {
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const monitorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const clearTimers = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    
    if (monitorIntervalRef.current) {
      clearInterval(monitorIntervalRef.current);
      monitorIntervalRef.current = null;
    }
  };
  
  useEffect(() => {
    clearTimers();
    
    if (!session?.expires_at) return;
    
    const scheduleRefresh = () => {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at;
      const timeUntilExpiry = expiresAt - now;
      
      if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
        console.log('Session expires soon, refreshing now...');
        supabase.auth.refreshSession()
          .then(({ data, error }) => {
            if (error) {
              console.error('Failed to refresh session:', error);
              toast.error('Phiên làm việc gần hết hạn', {
                description: 'Vui lòng đăng nhập lại để tiếp tục'
              });
            } else if (data.session) {
              console.log('Session refreshed successfully, new expiry:', 
                new Date(data.session.expires_at * 1000).toLocaleString());
            }
          });
          
        return;
      }
      
      if (timeUntilExpiry > 300) {
        const refreshDelay = (timeUntilExpiry - 300) * 1000;
        console.log(`Scheduling session refresh in ${Math.floor(refreshDelay/60000)} minutes`);
        
        refreshTimeoutRef.current = setTimeout(() => {
          console.log('Executing scheduled session refresh');
          supabase.auth.refreshSession()
            .then(({ data, error }) => {
              if (error) {
                console.error('Failed to refresh session:', error);
                toast.error('Không thể làm mới phiên làm việc', {
                  description: 'Vui lòng đăng nhập lại để tiếp tục'
                });
              } else if (data.session) {
                console.log('Session refreshed successfully, new expiry:', 
                  new Date(data.session.expires_at * 1000).toLocaleString());
              }
            });
        }, refreshDelay);
      }
    };
    
    scheduleRefresh();
    
    monitorIntervalRef.current = setInterval(() => {
      if (!session?.expires_at) return;
      
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = session.expires_at - currentTime;
      
      if (remainingTime < 0) {
        console.warn('Session has expired!');
        toast.error('Phiên làm việc đã hết hạn', {
          description: 'Vui lòng đăng nhập lại để tiếp tục'
        });
        clearInterval(monitorIntervalRef.current!);
      } else if (remainingTime < 300 && !refreshTimeoutRef.current) {
        scheduleRefresh();
      }
    }, 60000);
    
    return clearTimers;
  }, [session?.expires_at]);
};

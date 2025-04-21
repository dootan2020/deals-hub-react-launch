import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Session } from '@supabase/supabase-js';

export const useSessionMonitor = (
  session: Session | null,
  logout: () => Promise<void>
) => {
  const [lastSessionCheck, setLastSessionCheck] = useState(0);

  useEffect(() => {
    const checkSessionInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastSessionCheck > 2 * 60 * 1000) {
        setLastSessionCheck(now);
        if (session?.expires_at) {
          const currentTime = Math.floor(Date.now() / 1000);
          if (session.expires_at < currentTime) {
            console.log('Session has expired during app usage, logging out');
            logout().then(() => {
              toast.error("Phiên đăng nhập đã hết hạn", {
                description: "Vui lòng đăng nhập lại để tiếp tục" as any
              });
              setTimeout(() => {
                window.location.replace('/login?expired=1');
              }, 1000);
            });
          }
        }
      }
    }, 30000);
    
    return () => clearInterval(checkSessionInterval);
  }, [session, logout, lastSessionCheck]);
};

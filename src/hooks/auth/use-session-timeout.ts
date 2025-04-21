
import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

export const useSessionTimeout = (
  isAuthenticated: boolean,
  userId: string | undefined,
  sessionToken: string | undefined,
  logout: () => Promise<void>
) => {
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAuthenticated && userId && sessionToken) {
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
      
      sessionTimeoutRef.current = setTimeout(() => {
        console.warn('Session timeout reached, logging out user for security.');
        logout().finally(() => {
          toast.warning('Phiên làm việc hết hạn do không hoạt động', {
            description: 'Vui lòng đăng nhập lại để tiếp tục'
          });
          window.location.replace('/login?timeout=1');
        });
      }, 3 * 60 * 60 * 1000); // 3 hours
    } else {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
    }
    
    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
    };
  }, [userId, sessionToken, logout, isAuthenticated]);

  useEffect(() => {
    const resetTimeout = () => {
      if (isAuthenticated && sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = setTimeout(() => {
          console.warn('Session timeout reached, logging out user for security.');
          logout().finally(() => {
            window.location.replace('/login?timeout=1');
          });
        }, 3 * 60 * 60 * 1000);
      }
    };

    window.addEventListener('click', resetTimeout);
    window.addEventListener('keypress', resetTimeout);
    window.addEventListener('scroll', resetTimeout);
    window.addEventListener('mousemove', resetTimeout);

    return () => {
      window.removeEventListener('click', resetTimeout);
      window.removeEventListener('keypress', resetTimeout);
      window.removeEventListener('scroll', resetTimeout);
      window.removeEventListener('mousemove', resetTimeout);
    };
  }, [isAuthenticated, logout]);
};

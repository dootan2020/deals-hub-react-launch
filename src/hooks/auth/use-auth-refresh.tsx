
import { useState, useCallback, useEffect } from 'react';
import { reloadSession } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useAuthRefresh = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showRetry, setShowRetry] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isAutomaticRetry, setIsAutomaticRetry] = useState(false);
  const navigate = useNavigate();

  const resetState = useCallback(() => {
    setAttempts(0);
    setShowRetry(false);
    setLastError(null);
    setIsAutomaticRetry(false);
  }, []);

  const attemptRefresh = useCallback(async () => {
    if (refreshing || attempts >= 3) {
      console.log('Refresh blocked:', refreshing ? 'already refreshing' : 'max attempts reached');
      return false;
    }
    
    setRefreshing(true);
    const currentAttempt = attempts + 1;
    console.log(`Starting session refresh (attempt ${currentAttempt}/3)`);
    
    try {
      const { success, error, data } = await reloadSession();
      
      if (success && data?.session) {
        console.log('Session refreshed successfully', {
          expiresAt: new Date(data.session.expires_at * 1000).toLocaleString(),
          userId: data.session.user.id
        });
        resetState();
        return true;
      } else {
        const errorMessage = error?.message || 'Unknown error';
        console.error('Session refresh failed:', {
          attempt: currentAttempt,
          error: errorMessage,
          timestamp: new Date().toISOString()
        });
        
        setLastError(errorMessage);
        setAttempts(currentAttempt);
        
        if (currentAttempt >= 3) {
          console.warn('Maximum refresh attempts reached');
          setShowRetry(true);
        } else if (currentAttempt === 1 || currentAttempt === 2) {
          // Automatically retry once more for first two attempts
          setIsAutomaticRetry(true);
        }
        
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unexpected error during refresh';
      console.error('Session refresh error:', {
        attempt: currentAttempt,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      
      setLastError(errorMessage);
      setAttempts(currentAttempt);
      
      if (currentAttempt >= 3) {
        setShowRetry(true);
      } else if (currentAttempt === 1 || currentAttempt === 2) {
        // Automatically retry once more for first two attempts
        setIsAutomaticRetry(true);
      }
      
      return false;
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, attempts, resetState]);

  // Auto-retry logic
  useEffect(() => {
    let retryTimer: NodeJS.Timeout;
    
    if (isAutomaticRetry && !refreshing && attempts < 3) {
      console.log(`Setting up automatic retry #${attempts + 1} in 2 seconds...`);
      retryTimer = setTimeout(async () => {
        setIsAutomaticRetry(false);
        await attemptRefresh();
      }, 2000);
    }
    
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [isAutomaticRetry, refreshing, attempts, attemptRefresh]);

  const handleRetry = async () => {
    console.log('Initiating manual refresh retry');
    resetState();
    
    const success = await attemptRefresh();
    if (!success) {
      console.error('Manual refresh attempt failed, redirecting to login');
      toast({
        title: "Không thể khôi phục phiên",
        description: "Vui lòng đăng nhập lại để tiếp tục",
        variant: "destructive"
      });
      
      navigate('/login', { 
        state: { 
          authError: 'session_restore_failed',
          lastError: lastError || undefined
        },
        replace: true
      });
    }
  };

  return {
    refreshing,
    attempts,
    showRetry,
    lastError,
    attemptRefresh,
    handleRetry
  };
};

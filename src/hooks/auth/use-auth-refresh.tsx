
import { useState, useCallback, useEffect, useRef } from 'react';
import { reloadSession } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Constants for rate limiting and retry settings
const RATE_LIMIT_WINDOW = 10000; // 10 seconds between attempts
const MAX_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds between retries
const AUTO_RETRY_THRESHOLD = 2; // Auto retry for first 2 attempts

export const useAuthRefresh = () => {
  // Core state
  const [refreshing, setRefreshing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showRetry, setShowRetry] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  
  // Rate limiting and retry state
  const lastRefreshAttempt = useRef<number>(0);
  const retryTimer = useRef<NodeJS.Timeout | null>(null);
  const isAutoRetrying = useRef(false);
  
  const navigate = useNavigate();

  // Cleanup function
  const cleanup = useCallback(() => {
    if (retryTimer.current) {
      clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }
    isAutoRetrying.current = false;
  }, []);

  // Reset all state
  const resetState = useCallback(() => {
    setAttempts(0);
    setShowRetry(false);
    setLastError(null);
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    return cleanup; // Cleanup on unmount
  }, [cleanup]);

  const isRateLimited = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastRefreshAttempt.current;
    return timeSinceLastAttempt < RATE_LIMIT_WINDOW;
  }, []);

  const attemptRefresh = useCallback(async () => {
    // Prevent concurrent refreshes and respect rate limiting
    if (refreshing || attempts >= MAX_ATTEMPTS || isRateLimited()) {
      console.debug('Refresh blocked:', {
        reason: refreshing ? 'already refreshing' : 
                attempts >= MAX_ATTEMPTS ? 'max attempts reached' : 
                'rate limited',
        attempts,
        lastAttempt: new Date(lastRefreshAttempt.current).toISOString()
      });
      return false;
    }
    
    setRefreshing(true);
    const currentAttempt = attempts + 1;
    lastRefreshAttempt.current = Date.now();

    try {
      console.debug(`Starting session refresh (attempt ${currentAttempt}/${MAX_ATTEMPTS})`);
      
      const { success, error, data, rateLimited } = await reloadSession();
      
      if (rateLimited) {
        toast.error("Too many refresh attempts", {
          description: "Please wait before trying again"
        });
        return false;
      }

      if (success && data?.session) {
        console.debug('Session refreshed successfully', {
          expiresAt: new Date(data.session.expires_at * 1000).toLocaleString(),
          userId: data.session.user.id
        });
        resetState();
        return true;
      }

      // Handle error cases
      const errorMessage = error?.message || 'Unknown error';
      console.error('Session refresh failed:', {
        attempt: currentAttempt,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      
      setLastError(errorMessage);
      setAttempts(currentAttempt);
      
      // Only show retry button after all auto-retries are exhausted
      if (currentAttempt >= MAX_ATTEMPTS) {
        console.warn('Maximum refresh attempts reached');
        setShowRetry(true);
        cleanup(); // Ensure no more auto-retries
      } else if (currentAttempt <= AUTO_RETRY_THRESHOLD && !isAutoRetrying.current) {
        // Schedule auto-retry with exponential backoff
        isAutoRetrying.current = true;
        const delay = RETRY_DELAY * Math.pow(2, currentAttempt - 1);
        console.debug(`Scheduling auto-retry #${currentAttempt} in ${delay}ms`);
        
        retryTimer.current = setTimeout(() => {
          isAutoRetrying.current = false;
          attemptRefresh();
        }, delay);
      }
      
      return false;
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
      return false;
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, attempts, resetState, cleanup]);

  const handleManualRetry = useCallback(async () => {
    cleanup(); // Clear any pending auto-retries
    resetState(); // Reset attempt counter and error state
    
    const success = await attemptRefresh();
    if (!success) {
      console.error('Manual refresh attempt failed, redirecting to login');
      toast.error("Không thể khôi phục phiên", {
        description: "Vui lòng đăng nhập lại để tiếp tục"
      });
      
      navigate('/login', { 
        state: { 
          authError: 'session_restore_failed',
          lastError: lastError || undefined
        },
        replace: true
      });
    }
  }, [attemptRefresh, cleanup, resetState, navigate, lastError]);

  return {
    refreshing,
    attempts,
    showRetry,
    lastError,
    attemptRefresh,
    handleRetry: handleManualRetry
  };
};

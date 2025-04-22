
import { useState, useCallback, useRef } from 'react';
import { RetryConfig } from '@/types';
import { authMonitoring } from '@/utils/auth/auth-monitoring';

export const useAuthRetry = (config: RetryConfig) => {
  const [attempts, setAttempts] = useState(0);
  const [showRetry, setShowRetry] = useState(false);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleRetry = useCallback((action: () => Promise<boolean>) => {
    if (attempts >= config.maxAttempts) {
      setShowRetry(true);
      return;
    }

    const delay = Math.min(
      config.baseDelay * Math.pow(2, attempts),
      config.maxDelay
    );

    retryTimerRef.current = setTimeout(async () => {
      setAttempts(prev => prev + 1);
      const success = await action();
      
      if (!success && attempts < config.maxAttempts - 1) {
        scheduleRetry(action);
      } else if (!success) {
        setShowRetry(true);
      }
    }, delay);

    authMonitoring.logEvent({
      type: 'retry_scheduled',
      metadata: { attempt: attempts + 1, delay }
    });
  }, [attempts, config]);

  const reset = useCallback(() => {
    setAttempts(0);
    setShowRetry(false);
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  return {
    attempts,
    showRetry,
    scheduleRetry,
    reset,
    cleanup
  };
};

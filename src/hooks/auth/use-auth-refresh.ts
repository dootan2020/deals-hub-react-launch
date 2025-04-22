
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RetryConfig } from '@/types';
import { authMonitoring } from '@/utils/auth/auth-monitoring';

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 2000,
  maxDelay: 16000
};

export const useAuthRefresh = (config: RetryConfig = DEFAULT_RETRY_CONFIG) => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshAttempt, setLastRefreshAttempt] = useState<number>(0);

  const attemptRefresh = useCallback(async () => {
    if (refreshing) return false;

    const now = Date.now();
    const timeSinceLastAttempt = now - lastRefreshAttempt;
    if (timeSinceLastAttempt < config.baseDelay) {
      return false;
    }

    setRefreshing(true);
    setLastRefreshAttempt(now);

    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;

      authMonitoring.logEvent({
        type: 'refresh_success',
        metadata: { userId: data.session?.user.id }
      });

      return true;
    } catch (error) {
      authMonitoring.logEvent({
        type: 'refresh_error',
        metadata: { error: error.message }
      });
      return false;
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, lastRefreshAttempt, config.baseDelay]);

  return {
    refreshing,
    attemptRefresh,
    lastRefreshAttempt
  };
};


import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to manage auth refresh attempts with backoff
 */
export const useAuthRefresh = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showRetry, setShowRetry] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const attemptRefresh = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    setAttempts(prev => prev + 1);
    
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        // After 3 failed attempts, show retry button
        if (attempts >= 2) {
          setShowRetry(true);
        } else {
          // Schedule another automatic attempt with exponential backoff
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          const backoff = Math.min(2000 * Math.pow(2, attempts), 16000);
          timeoutRef.current = setTimeout(attemptRefresh, backoff);
        }
      } else {
        console.log('Session refreshed successfully:', !!data.session);
        setShowRetry(false);
        setAttempts(0);
      }
    } catch (error) {
      console.error('Unexpected error during refresh:', error);
      setShowRetry(true);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, attempts]);
  
  const handleRetry = useCallback(() => {
    setShowRetry(false);
    attemptRefresh();
  }, [attemptRefresh]);
  
  // Clean up on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  return {
    refreshing,
    attempts,
    showRetry,
    attemptRefresh,
    handleRetry,
    cleanup
  };
};

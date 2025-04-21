
import { useState, useCallback } from 'react';

/**
 * Hook to debounce function execution and track cooldown state
 * @param callback The function to debounce
 * @param cooldownMs The cooldown period in milliseconds
 * @returns Object with debounced function and state
 */
export function useDebounce<T extends (...args: any[]) => Promise<any>>(
  callback: T,
  cooldownMs: number = 1000
) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
      // If already executing or in cooldown, don't proceed
      if (isExecuting || cooldown > 0) {
        return null;
      }

      setIsExecuting(true);
      try {
        const result = await callback(...args);
        
        // Set cooldown timer
        setCooldown(Math.floor(cooldownMs / 1000));
        const intervalId = setInterval(() => {
          setCooldown(prev => {
            if (prev <= 1) {
              clearInterval(intervalId);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return result;
      } finally {
        setIsExecuting(false);
      }
    },
    [callback, cooldownMs, isExecuting, cooldown]
  );

  return {
    execute,
    isExecuting,
    cooldown,
    isDisabled: isExecuting || cooldown > 0,
    cooldownText: cooldown > 0 ? `Vui lòng đợi ${cooldown}s` : undefined
  };
}

/**
 * Hook to debounce a callback with auto-retry in case of rate limiting
 * @param callback The function to debounce
 * @param options Configuration options
 * @returns Object with debounced function and state
 */
export function useRateLimitedAction<T extends (...args: any[]) => Promise<any>>(
  callback: T,
  options: {
    cooldownMs?: number;
    onRateLimit?: (retryAfter: number) => void;
    onError?: (error: any) => void;
    onSuccess?: () => void;
  } = {}
) {
  const {
    cooldownMs = 1000,
    onRateLimit,
    onError,
    onSuccess
  } = options;
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
      // If already executing or in cooldown, don't proceed
      if (isExecuting || cooldown > 0) {
        return null;
      }

      setIsExecuting(true);
      try {
        const result = await callback(...args);
        
        // Set cooldown timer for successful actions
        setCooldown(Math.floor(cooldownMs / 1000));
        const intervalId = setInterval(() => {
          setCooldown(prev => {
            if (prev <= 1) {
              clearInterval(intervalId);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        if (onSuccess) {
          onSuccess();
        }
        
        return result;
      } catch (error: any) {
        // Special handling for rate limit errors
        if (error.message?.includes('Too Many Requests') || 
            error.status === 429 || 
            error.message?.includes('Rate limit')) {
          
          let retryAfter = 60; // Default retry time
          
          // Try to extract retry time from error response
          try {
            if (typeof error.retryAfter === 'number') {
              retryAfter = error.retryAfter;
            } else if (typeof error.message === 'string' && error.message.includes('Try again in')) {
              const match = error.message.match(/Try again in (\d+) seconds/);
              if (match && match[1]) {
                retryAfter = parseInt(match[1], 10);
              }
            }
          } catch (parseError) {
            console.error('Error parsing retry after value:', parseError);
          }
          
          // Set cooldown based on the rate limit response
          setCooldown(retryAfter);
          const intervalId = setInterval(() => {
            setCooldown(prev => {
              if (prev <= 1) {
                clearInterval(intervalId);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          if (onRateLimit) {
            onRateLimit(retryAfter);
          }
        } else if (onError) {
          // Handle other errors
          onError(error);
        }
        
        throw error;
      } finally {
        setIsExecuting(false);
      }
    },
    [callback, cooldownMs, isExecuting, cooldown, onRateLimit, onError, onSuccess]
  );

  return {
    execute,
    isExecuting,
    cooldown,
    isDisabled: isExecuting || cooldown > 0,
    cooldownText: cooldown > 0 ? `${cooldown}s` : undefined
  };
}

export default useDebounce;


/**
 * Executes a Promise with a timeout and retry capability
 * @param promise The promise to execute
 * @param timeoutMs Timeout in milliseconds
 * @param errorMessage Custom error message for timeout
 * @param retries Number of retries on failure (default: 1)
 * @param retryDelay Delay between retries in ms (default: 1000)
 * @returns Promise result or throws error on timeout
 */
export const fetchWithTimeout = <T>(
  promise: Promise<T>, 
  timeoutMs: number = 15000, // Reduced timeout to be more realistic
  errorMessage: string = 'Quá thời gian xử lý yêu cầu',
  retries: number = 1,
  retryDelay: number = 1000
): Promise<T> => {
  console.log(`Starting request with ${timeoutMs}ms timeout, ${retries} retries`);
  
  let currentAttempt = 0;
  
  const executeWithRetry = async (): Promise<T> => {
    currentAttempt++;
    try {
      // Create a promise that rejects on timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          clearTimeout(timeoutId);
          reject(new Error(`${errorMessage} (after ${timeoutMs}ms)`));
        }, timeoutMs);
      });
      
      // Wrap the original promise with additional logging
      const wrappedPromise = promise.then(result => {
        console.log(`Promise resolved successfully (attempt ${currentAttempt})`);
        return result;
      }).catch(error => {
        console.error(`Promise rejected with error (attempt ${currentAttempt}):`, error?.message || error);
        throw error;
      });
      
      // Race between the original promise and the timeout
      return await Promise.race([wrappedPromise, timeoutPromise]);
    } catch (error) {
      // If we have retries left, try again after delay
      if (currentAttempt <= retries) {
        console.log(`Retrying after error (attempt ${currentAttempt}/${retries + 1})...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return executeWithRetry();
      }
      
      // No more retries, propagate the error
      throw error;
    }
  };
  
  return executeWithRetry();
};

/**
 * Creates a debounced version of a function
 * @param func The function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Creates a throttled version of a function
 * @param func The function to throttle
 * @param limit Limit time in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;
  
  return function(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      lastArgs = null;
      
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          func(...lastArgs);
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

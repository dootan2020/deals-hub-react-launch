
/**
 * Executes a Promise with a timeout
 * @param promise The promise to execute
 * @param timeoutMs Timeout in milliseconds
 * @param errorMessage Custom error message for timeout
 * @returns Promise result or throws error on timeout
 */
export const fetchWithTimeout = <T>(
  promise: Promise<T>, 
  timeoutMs: number = 30000, // Increased from 15000ms to 30000ms for initial debugging
  errorMessage: string = 'Quá thời gian xử lý yêu cầu'
): Promise<T> => {
  console.log(`Starting request with ${timeoutMs}ms timeout`);
  
  // Add more detailed logging to track promise execution
  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise
      .then(result => {
        console.log('Promise resolved successfully');
        resolve(result);
      })
      .catch(error => {
        console.error('Promise rejected with error:', error?.message || error);
        reject(error);
      });
  });
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timeoutId = setTimeout(() => {
      clearTimeout(timeoutId);
      console.error(`Request timed out after ${timeoutMs}ms`);
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  return Promise.race([wrappedPromise, timeoutPromise]);
};

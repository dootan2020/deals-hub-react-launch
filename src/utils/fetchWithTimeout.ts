
/**
 * Executes a Promise with a timeout
 * @param promise The promise to execute
 * @param timeoutMs Timeout in milliseconds
 * @param errorMessage Custom error message for timeout
 * @returns Promise result or throws error on timeout
 */
export const fetchWithTimeout = <T>(
  promise: Promise<T>, 
  timeoutMs: number = 15000, // Increased from 7000ms to 15000ms
  errorMessage: string = 'Quá thời gian xử lý yêu cầu'
): Promise<T> => {
  console.log(`Starting request with ${timeoutMs}ms timeout`);
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timeoutId = setTimeout(() => {
      clearTimeout(timeoutId);
      console.error(`Request timed out after ${timeoutMs}ms`);
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
};

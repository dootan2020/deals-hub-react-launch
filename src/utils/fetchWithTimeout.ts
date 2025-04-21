
/**
 * Executes a Promise with a timeout
 * @param promise The promise to execute
 * @param timeoutMs Timeout in milliseconds
 * @param errorMessage Custom error message for timeout
 * @returns Promise result or throws error on timeout
 */
export const fetchWithTimeout = <T>(
  promise: Promise<T>, 
  timeoutMs: number = 7000, 
  errorMessage: string = 'Quá thời gian xử lý yêu cầu'
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timeoutId = setTimeout(() => {
      clearTimeout(timeoutId);
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
};

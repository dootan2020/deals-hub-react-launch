
/**
 * Utility functions to help with Supabase type safety
 */

// Safely cast values as "unknown" to bypass TypeScript's strict type checking for Supabase queries
export const asUnknown = <T>(value: T): unknown => value as unknown;

/**
 * Helper function to safely prepare query parameters for Supabase filters to avoid TypeScript errors
 * @param value - The value to prepare as a query parameter
 * @returns The value cast to unknown to bypass TypeScript's strict type checking
 */
export const prepareQueryParam = <T>(value: T): string => {
  // Cast to string to ensure compatibility with Supabase filter operations
  return String(value);
};

/**
 * Helper function to safely prepare data for insert operations
 * @param data - The data to prepare for insert
 * @returns The data cast to unknown to bypass TypeScript's strict type checking
 */
export const prepareInsertData = <T extends Record<string, any>>(data: T): any => {
  return data as any;
};

/**
 * Helper function to safely prepare data for update operations
 * @param data - The data to prepare for update
 * @returns The data cast to unknown to bypass TypeScript's strict type checking
 */
export const prepareUpdateData = <T extends Record<string, any>>(data: T): any => {
  return data as any;
};

/**
 * Helper function to safely extract data from Supabase responses
 * @param result - The Supabase query result
 * @returns The data extracted from the result, or null if there's an error or no data
 */
export const extractSafeData = <T>(result: any): T | null => {
  if (!result || result.error) {
    return null;
  }
  
  // Handle case where data might be directly available
  if (result && typeof result === 'object' && !('data' in result)) {
    return result as T;
  }
  
  // Handle case where data is null or undefined
  if (!result.data) {
    return null;
  }
  
  return result.data as T;
};

/**
 * Helper function to safely access properties from Supabase query results
 * @param obj - The object from which to safely access properties
 * @param key - The key of the property to access
 * @param defaultValue - The default value to return if the property does not exist
 * @returns The property value or default value
 */
export const safeGetProperty = <T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  defaultValue?: T[K]
): T[K] | undefined => {
  if (!obj) return defaultValue;
  const value = obj[key];
  return value !== undefined ? value : defaultValue;
};

/**
 * Helper function to check if a response contains data and no error
 */
export const isDataResponse = <T = any>(response: { data: T | null, error: any | null }): response is { data: T, error: null } => {
  return response.data !== null && response.error === null;
};

/**
 * Helper function to safely extract property value from potential database error
 * This is especially useful for handling properties that might not exist on error types
 */
export const safeExtractProperty = <T>(obj: any, propertyName: string, defaultValue: T): T => {
  if (!obj) return defaultValue;
  if (typeof obj !== 'object') return defaultValue;
  if ('error' in obj && obj.error) return defaultValue;
  return (obj[propertyName] as T) || defaultValue;
};

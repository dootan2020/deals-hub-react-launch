
/**
 * Utility functions to help with Supabase type safety
 */

// Safely cast values as "unknown" to bypass TypeScript's strict type checking for Supabase queries
export const asUnknown = <T>(value: T): unknown => value as unknown;

/**
 * Helper function to safely cast database query parameters to avoid TypeScript errors
 * This can be used to safely pass string IDs where Supabase expects complex types
 */
export function safeQueryParam<T>(param: T): any {
  return param as any;
}

/**
 * Helper function to safely handle database data with proper typing
 */
export function safeDatabaseData<T>(data: T): any {
  return data as any;
}

/**
 * Helper function to safely extract property value from potential database error
 * This is especially useful for handling properties that might not exist on error types
 */
export function safeExtractProperty<T>(obj: any, propertyName: string, defaultValue: T): T {
  if (!obj) return defaultValue;
  if (typeof obj !== 'object') return defaultValue;
  if ('error' in obj && obj.error) return defaultValue;
  return (obj[propertyName] as T) || defaultValue;
}

/**
 * Helper function to safely handle Supabase response data with proper typing
 */
export function safeResponseData<T>(response: any): T | null {
  if (response?.error) return null;
  return (response?.data as T) || null;
}

/**
 * Helper function to safely extract ID from a Supabase response
 * This is safer than directly accessing id which might not exist on error types
 */
export function safeExtractId<T extends string | number>(data: any, defaultValue: T | null = null): T | null {
  return safeExtractProperty<T | null>(data, 'id', defaultValue);
}

/**
 * Helper function to safely prepare data for insert operations
 */
export function prepareInsertData<T extends Record<string, any>>(data: T): any {
  return data as any;
}

/**
 * Helper function to safely prepare data for update operations
 */
export function prepareUpdateData<T extends Record<string, any>>(data: T): any {
  return data as any;
}

/**
 * Helper function to safely prepare query parameters for Supabase filters to avoid TypeScript errors
 */
export function prepareQueryParam<T>(value: T): any {
  return value as any;
}

/**
 * Helper function to safely check if the response contains a specific ID
 */
export function hasId(data: any): boolean {
  if (!data) return false;
  if (typeof data !== 'object') return false;
  return 'id' in data && data.id !== null && data.id !== undefined;
}

/**
 * Helper function to check if a response contains data and no error
 */
export function isDataResponse<T = any>(response: { data: T | null, error: any | null }): response is { data: T, error: null } {
  return response.data !== null && response.error === null;
}

/**
 * Helper function to safely access properties from Supabase query results
 */
export function safeGetProperty<T, K extends keyof T>(
  obj: T | null | undefined, 
  key: K, 
  defaultValue?: T[K]
): T[K] | undefined {
  if (!obj) return defaultValue;
  const value = obj[key];
  return value !== undefined ? value : defaultValue;
}

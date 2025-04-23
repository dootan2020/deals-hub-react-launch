
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
export const prepareQueryParam = <T>(value: T): unknown => {
  return value as unknown;
};

/**
 * Helper function to safely prepare data for insert operations
 * @param data - The data to prepare for insert
 * @returns The data cast to unknown to bypass TypeScript's strict type checking
 */
export const prepareInsertData = <T extends Record<string, any>>(data: T): unknown => {
  return data as unknown;
};

/**
 * Helper function to safely prepare data for update operations
 * @param data - The data to prepare for update
 * @returns The data cast to unknown to bypass TypeScript's strict type checking
 */
export const prepareUpdateData = <T extends Record<string, any>>(data: T): unknown => {
  return data as unknown;
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
 * Helper function to safely cast a Supabase query result to a specific type
 * @param data - The data to cast
 * @returns The data cast to the specified type, or null if the data is null or undefined
 */
export const safeTypeCast = <T>(data: any): T | null => {
  if (data === null || data === undefined) return null;
  return data as T;
};

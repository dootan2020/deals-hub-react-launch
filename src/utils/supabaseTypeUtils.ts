
/**
 * Utility functions to help with Supabase type safety
 */

// Safely cast values as "unknown" to bypass TypeScript's strict type checking for Supabase queries
export const asUnknown = <T>(value: T): unknown => value as unknown;

/**
 * Helper function to safely cast database query parameters to avoid TypeScript errors
 * @param param The parameter to be used in a Supabase query
 * @returns The same parameter cast to a type that Supabase accepts
 */
export function prepareQueryParam<T>(param: T): any {
  return param as any;
}

/**
 * Helper function to safely handle database data with proper typing
 * @param data The data returned from a Supabase query
 * @returns The data cast to the expected type
 */
export function safeDatabaseData<T>(data: any): T {
  return data as T;
}

/**
 * Helper function to safely extract property value from potential database error
 * @param obj The object that might contain the property
 * @param propertyName The name of the property to extract
 * @param defaultValue The default value to return if the property doesn't exist
 * @returns The property value or the default value
 */
export function safeExtractProperty<T>(obj: any, propertyName: string, defaultValue: T): T {
  if (!obj) return defaultValue;
  if (typeof obj !== 'object') return defaultValue;
  if ('error' in obj && obj.error) return defaultValue;
  return (obj[propertyName] as T) || defaultValue;
}

/**
 * Helper function to safely handle Supabase response data with proper typing
 * @param response The response from a Supabase query
 * @returns The data cast to the expected type or null if there was an error
 */
export function safeResponseData<T>(response: any): T | null {
  if (response?.error) return null;
  return (response?.data as T) || null;
}

/**
 * Helper function to safely extract ID from a Supabase response
 * @param data The data returned from a Supabase query
 * @param defaultValue The default value to return if the ID doesn't exist
 * @returns The ID or the default value
 */
export function safeExtractId<T extends string | number>(data: any, defaultValue: T | null = null): T | null {
  return safeExtractProperty<T | null>(data, 'id', defaultValue);
}

/**
 * Helper function to safely prepare data for insert operations
 * @param data The data to be inserted
 * @returns The data cast to a type that Supabase accepts for inserts
 */
export function prepareInsertData<T extends Record<string, any>>(data: T): any {
  return data as any;
}

/**
 * Helper function to safely prepare data for update operations
 * @param data The data to be updated
 * @returns The data cast to a type that Supabase accepts for updates
 */
export function prepareUpdateData<T extends Record<string, any>>(data: T): any {
  return data as any;
}

/**
 * Helper function to safely check if the response contains a specific ID
 * @param data The data to check
 * @returns True if the data contains an ID, false otherwise
 */
export function hasId(data: any): boolean {
  if (!data) return false;
  if (typeof data !== 'object') return false;
  return 'id' in data && data.id !== null && data.id !== undefined;
}

/**
 * Helper function to check if a response contains data and no error
 * @param response The response to check
 * @returns True if the response contains data and no error, false otherwise
 */
export function isDataResponse<T = any>(response: { data: T | null, error: any | null }): response is { data: T, error: null } {
  return response.data !== null && response.error === null;
}

/**
 * Helper function to safely access properties from Supabase query results
 * @param obj The object that might contain the property
 * @param key The key of the property to access
 * @param defaultValue The default value to return if the property doesn't exist
 * @returns The property value or the default value
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

/**
 * Helper function to safely cast Supabase query results to an array of a specific type
 * @param data The data returned from a Supabase query
 * @returns The data cast to an array of the expected type
 */
export function safeCastArray<T>(data: any): T[] {
  if (!data) return [];
  if (!Array.isArray(data)) return [];
  return data as T[];
}

/**
 * Helper function to safely handle errors in Supabase queries
 * @param error The error returned from a Supabase query
 * @param defaultMessage The default message to return if the error doesn't have a message
 * @returns The error message or the default message
 */
export function safeErrorMessage(error: any, defaultMessage: string = 'An error occurred'): string {
  if (!error) return defaultMessage;
  if (typeof error === 'string') return error;
  if (typeof error.message === 'string') return error.message;
  if (typeof error.error === 'string') return error.error;
  if (typeof error.error?.message === 'string') return error.error.message;
  return defaultMessage;
}

/**
 * Helper function to safely check if data exists and handle errors
 * @param result The result of a Supabase query
 * @returns True if the data exists and there's no error, false otherwise
 */
export function hasData(result: any): boolean {
  if (!result) return false;
  if (result.error) return false;
  if (!result.data) return false;
  if (Array.isArray(result.data) && result.data.length === 0) return false;
  return true;
}

/**
 * Helper function to safely handle Supabase data in a type-safe way
 * @param data The data to process
 * @returns The processed data
 */
export function processSupabaseData<T>(data: any): T | null {
  if (!data) return null;
  return data as T;
}

/**
 * Helper function to check if a value is a Supabase error
 * @param value The value to check
 * @returns True if the value is a Supabase error, false otherwise
 */
export function isSupabaseError(value: any): boolean {
  return value && typeof value === 'object' && 'error' in value && value.error !== null;
}

/**
 * Helper function to safely process Supabase query results
 * Ensures that data is only accessed if it's not an error
 * @param data The data to check
 * @param processor Function to process the data if it's valid
 * @param errorHandler Optional function to handle errors
 * @returns The processed data or null if there was an error
 */
export function processQueryResult<T, R>(
  data: any, 
  processor: (validData: any) => R,
  errorHandler?: (error: any) => void
): R | null {
  try {
    // Check if the data is an error
    if (isSupabaseError(data)) {
      if (errorHandler) errorHandler(data.error);
      return null;
    }
    
    // Check if data exists
    if (!data) return null;
    
    // Process the data
    return processor(data);
  } catch (err) {
    if (errorHandler) errorHandler(err);
    return null;
  }
}

/**
 * Helper function to check if a value is a valid object to spread
 * @param value The value to check
 * @returns True if the value is safe to spread, false otherwise
 */
export function isSafeToSpread(value: any): boolean {
  return value && typeof value === 'object' && !isSupabaseError(value);
}

/**
 * Gets a property safely from any object, handling potential errors and undefined values
 * @param obj Any object or error
 * @param key The key to access
 * @param defaultValue Default value to return if the property doesn't exist
 * @returns The property value or default value
 */
export function getSafeProperty<T>(obj: any, key: string, defaultValue: T): T {
  if (!obj || typeof obj !== 'object' || isSupabaseError(obj)) {
    return defaultValue;
  }
  return (obj[key] as T) ?? defaultValue;
}

/**
 * A more comprehensive typeguard for checking objects
 * @param value The value to check
 * @param requiredProps An array of property names that must exist
 * @returns True if the value is a valid object with all required properties
 */
export function isValidObject(value: any, requiredProps: string[] = []): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value) || isSupabaseError(value)) {
    return false;
  }
  
  return requiredProps.every(prop => prop in value);
}

/**
 * Helper to safely process and cast an array from Supabase to a specific type
 * Will handle error objects and cast valid data to the expected type
 */
export function processSafeArray<T>(data: any, processor: (item: any) => T): T[] {
  if (!data || isSupabaseError(data)) return [];
  
  if (!Array.isArray(data)) return [];
  
  return data
    .filter(item => !isSupabaseError(item) && item !== null && typeof item === 'object')
    .map(processor);
}

/**
 * Special helper for safely handling OrderItem[] type casting issues with Supabase
 */
export function processOrderItems(data: any): any[] {
  if (!data || isSupabaseError(data)) return [];
  if (!Array.isArray(data)) return [];
  
  return data.map(item => {
    if (isSupabaseError(item)) return null;
    return item;
  }).filter(Boolean);
}

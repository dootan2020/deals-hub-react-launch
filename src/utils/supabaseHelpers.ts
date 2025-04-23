
// Helper functions for handling Supabase data safely

/**
 * Safely extracts data from a Supabase response
 * @param result The response from a Supabase query
 * @returns The extracted data or null if there was an error
 */
export function extractSafeData<T>(result: any): T | null {
  if (!result || result.error || !result.data) {
    return null;
  }
  return result.data as T;
}

/**
 * Safely converts a value to a number
 * @param value The value to convert
 * @param defaultValue The default value to use if conversion fails
 * @returns The converted number or the default value
 */
export function safeNumber(value: any, defaultValue = 0): number {
  if (value === null || value === undefined) return defaultValue;
  
  if (typeof value === 'number') return value;
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  
  return defaultValue;
}

/**
 * Checks if a value is a valid array of a specific type
 * @param value The value to check
 * @returns True if the value is a valid array, false otherwise
 */
export function isValidArray<T>(value: any): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if an object is a deposit record
 */
export function isDeposit(obj: any): boolean {
  return obj && typeof obj === 'object' && 'amount' in obj && 'status' in obj;
}

/**
 * Type guard to check if an object is an order record
 */
export function isOrder(obj: any): boolean {
  return obj && typeof obj === 'object' && 'total_price' in obj && 'status' in obj;
}

/**
 * Type for order data from Supabase
 */
export interface OrderData {
  id: string;
  user_id: string;
  status: string;
  total_price: number;
  created_at: string;
}

/**
 * Type guard to check if an object is a Supabase record
 */
export function isSupabaseRecord(obj: any): boolean {
  return obj && typeof obj === 'object' && 'id' in obj;
}

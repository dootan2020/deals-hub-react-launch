
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Casts Supabase data response to a specific type with a default fallback
 * @param data Data from a Supabase query
 * @param defaultValue Default value to use if data is null or has an error
 */
export function castData<T>(data: any, defaultValue: T): T {
  // If data is null, undefined, or has an error property, return the default value
  if (!data || data.error || (typeof data === 'object' && 'error' in data)) {
    return defaultValue;
  }
  return data as T;
}

/**
 * Casts Supabase array data response to a specific type
 * @param data Data from a Supabase query returning multiple items
 * @param defaultValue Default array to return if data is null or has an error
 */
export function castArrayData<T>(data: any, defaultValue: T[] = []): T[] {
  // If data is null, undefined, or has an error property, return an empty array or default
  if (!data || data.error || (typeof data === 'object' && 'error' in data)) {
    return defaultValue;
  }
  
  // Ensure we're returning an array
  if (!Array.isArray(data)) {
    console.warn('Expected array data from Supabase but got:', typeof data);
    return defaultValue;
  }
  
  return data as T[];
}

/**
 * Safely gets a property from an object that might be an error or null
 * @param obj The object to access
 * @param prop The property to access
 * @param defaultValue Default value if property doesn't exist
 */
export function safeGet<T, K extends keyof T>(obj: any, prop: K, defaultValue: any): T[K] {
  if (!obj || typeof obj !== 'object' || obj.error) {
    return defaultValue;
  }
  return (obj as T)[prop] !== undefined ? (obj as T)[prop] : defaultValue;
}

/**
 * Prepares an ID for use in Supabase queries by ensuring it's converted to a string
 * @param id The ID to prepare (UUID, string, or other)
 */
export function prepareQueryId(id: string | unknown): string {
  if (!id) return '';
  return String(id);
}

/**
 * Prepares data for insertion by removing undefined values
 * @param data Data object to prepare
 */
export function prepareDataForInsert<T extends Record<string, any>>(data: T): T {
  const result: Record<string, any> = {};
  
  for (const key in data) {
    if (data[key] !== undefined) {
      result[key] = data[key];
    }
  }
  
  return result as T;
}

/**
 * Runs a Supabase query and handles various error types safely
 * @param queryFn Function that returns a Supabase query
 * @param defaultValue Default value to return on error
 */
export async function safeQuery<T>(queryFn: () => Promise<{ data: any; error: PostgrestError | null }>, defaultValue: T): Promise<T> {
  try {
    const { data, error } = await queryFn();
    if (error) {
      console.error('Database query error:', error);
      return defaultValue;
    }
    return (data as T) || defaultValue;
  } catch (err) {
    console.error('Error executing query:', err);
    return defaultValue;
  }
}

/**
 * Checks if a Supabase response contains an error
 * @param response The Supabase response to check
 */
export function hasSupabaseError(response: any): boolean {
  return !response || response.error || (typeof response === 'object' && 'error' in response);
}

/**
 * Extracts a readable error message from a Supabase error
 * @param error The error to extract a message from
 */
export function extractErrorMessage(error: any): string {
  if (!error) return 'Unknown error';
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  if (error.error_description) {
    return error.error_description;
  }
  
  if (error.details) {
    return error.details;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Creates a default product object with empty values
 * For use when a product can't be loaded
 */
export function createDefaultProduct() {
  return {
    id: '',
    title: '',
    description: '',
    price: 0,
    original_price: null,
    in_stock: true,
    slug: '',
    external_id: null,
    category_id: '',
    images: [],
    kiosk_token: '',
    stock: 0,
    api_name: '',
    api_price: 0,
    api_stock: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Creates a default order object with empty values
 */
export function createDefaultOrder() {
  return {
    id: '',
    user_id: '',
    product_id: null,
    qty: 0,
    total_price: 0,
    status: 'pending',
    external_order_id: null,
    promotion_code: null,
    keys: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Creates a default order item object with empty values
 */
export function createDefaultOrderItem() {
  return {
    id: '',
    order_id: '',
    product_id: null,
    quantity: 0,
    price: 0,
    external_product_id: null,
    created_at: new Date().toISOString()
  };
}

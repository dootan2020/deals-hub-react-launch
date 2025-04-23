
import { PostgrestError, PostgrestSingleResponse } from '@supabase/supabase-js';

// Type guard to check if a value is a record (object)
export function isValidRecord<T = Record<string, any>>(value: any): value is T {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Type guard to check if a value is an array of a specific type
export function isValidArray<T = any>(value: any): value is T[] {
  return Array.isArray(value);
}

// Type guard to check if a value is a Supabase record (has id)
export function isSupabaseRecord<T = Record<string, any>>(value: any): value is T {
  return isValidRecord(value) && 'id' in value;
}

// Type definition for order data structure
export interface OrderData {
  id: string | number;
  user_id: string;
  created_at: string;
  status: string;
  external_order_id?: string;
  total_price: number;
}

// Type guard for order data
export function isOrder(value: any): value is OrderData {
  return (
    isValidRecord(value) &&
    'id' in value &&
    'user_id' in value &&
    'created_at' in value &&
    'status' in value &&
    'total_price' in value
  );
}

// Type definition for deposit data structure
export interface DepositData {
  id: string | number;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  payment_method: string;
  transaction_id?: string;
}

// Type guard for deposit data
export function isDeposit(value: any): value is DepositData {
  return (
    isValidRecord(value) &&
    'id' in value &&
    'user_id' in value &&
    'amount' in value &&
    'status' in value &&
    'created_at' in value
  );
}

// Helper to check if a response contains data and no error
export function isDataResponse<T = any>(response: { data: T | null, error: PostgrestError | null }): response is { data: T, error: null } {
  return response.data !== null && response.error === null;
}

// Type guard to check if a value is an error response
export function isErrorResponse(response: any): response is { error: PostgrestError } {
  return isValidRecord(response) && 'error' in response && response.error !== null;
}

// Helper to format UUID for Supabase queries - returns UUID type compatible with Supabase
export function formatUuid(id: string | null | undefined): unknown {
  if (!id) return '';
  return id as unknown;
}

// Helper to return a safer UUID format for filtering
export function toFilterableUUID(id: string | null | undefined): unknown {
  if (!id) return '';
  return id as unknown;
}

// Helper to safely convert a value to a string
export function safeString(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

// Helper to safely convert a value to a number
export function safeNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

// Helper to safely convert a value to a boolean
export function safeBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return Boolean(value);
}

// Helper to safely get a UUID string
export function safeUUID(value: any): string {
  if (!value) return '';
  const str = String(value);
  // Simple UUID validation (basic format check)
  if (/^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(str)) {
    return str;
  }
  return '';
}

// Helper to handle Supabase data safely
export function handleSupabaseData<T>(response: { data: any, error: PostgrestError | null }): T | null {
  if (response.error) {
    console.error('Supabase error:', response.error);
    return null;
  }
  
  if (!response.data) {
    return null;
  }
  
  return response.data as T;
}

// Helper to safely process Supabase query results
export function processSupabaseData<T>(result: { data: any, error: PostgrestError | null }): T | null {
  if (result.error) {
    console.error('Supabase query error:', result.error);
    return null;
  }
  return result.data as T;
}

// Helper for typed query results
export function ensureDataIsValid<T>(data: any): T | null {
  if (!data || typeof data !== 'object') return null;
  return data as T;
}

// Determine if result is an error
export function isSupabaseError(result: any): boolean {
  return result && typeof result === 'object' && 'error' in result && result.error !== null;
}

// Safely handle UUID for filter operations (cast UUID to unknown for proper typing)
export function uuidFilter(id: string | null | undefined): unknown {
  if (!id) return '';
  return id as unknown;
}

// Safe conversion for data types when working with Supabase
export function safeCastData<T>(data: any): T | null {
  if (!data) return null;
  if (isSupabaseError(data)) return null;
  return data as T;
}

// Cast ID for comparison in Supabase queries (safely)
export function safeId(id: string | number | null | undefined): unknown {
  if (id === null || id === undefined) return '';
  return id as unknown;
}

// Type-safe Supabase ID filter
export function idEqualFilter<T>(column: string, value: T): { [key: string]: unknown } {
  return { [column]: value as unknown };
}

// Cast object to Supabase insert/update format safely
export function asSupabaseTable<T>(data: Record<string, any>): unknown {
  return data as unknown;
}

// For safely checking and typing query results
export function checkAndCastQueryData<T>(result: { data: any, error: PostgrestError | null }): T | null {
  if (result.error) {
    console.error('Query error:', result.error);
    return null;
  }
  
  if (!result.data) {
    return null;
  }
  
  return result.data as T;
}

// Special helper for safely updating data with proper typing
export function prepareForUpdate<T>(data: Record<string, any>): unknown {
  // This ensures the type is cast properly for Supabase's strict typing
  return data as unknown;
}

// Helper for safe insert operations with proper typing
export function prepareForInsert<T>(data: Record<string, any>): unknown {
  // This ensures the type is cast properly for Supabase's strict typing
  return data as unknown;
}

/**
 * Helper function to safely extract data from Supabase responses
 * Handles type safety with SingleMaybeSingleResponse
 */
export function extractSafeData<T>(result: PostgrestSingleResponse<any>): T | null {
  if (result.error || !result.data) {
    result.error && console.error('Supabase error:', result.error);
    return null;
  }
  
  // Ensure we're returning correctly typed data
  return result.data as T;
}

/**
 * Type-safe way to handle Supabase UUID filter comparisons
 */
export function safeUuidEq<T>(column: string, uuid: string | null | undefined): { [key: string]: unknown } | null {
  if (!uuid) return null;
  // Return a filter object for the .eq method
  return { [column]: uuid as unknown };
}

/**
 * Safely cast array data from Supabase response
 */
export function safeCastArray<T>(data: any): T[] {
  if (!data || !Array.isArray(data)) return [];
  return data as T[];
}

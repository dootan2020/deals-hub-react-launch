
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

// Helper to format UUID for Supabase queries
// Uses type casting to make TypeScript happy while ensuring the UUID is passed correctly
export function formatUuid(id: string | null | undefined): any {
  if (!id) return '';
  return id as any;
}

// Helper for Supabase ID equality filtering
export function safeId(id: string | number | null | undefined): any {
  if (id === null || id === undefined) return '';
  return id as any;
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

// Safely cast data to desired type, checking for errors first
export function safeCastData<T>(data: any): T | null {
  if (!data) return null;
  if (isSupabaseError(data)) return null;
  return data as T;
}

/**
 * Universal helper to safely extract data from Supabase responses
 * Handles type safety with PostgrestSingleResponse
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
 * Safely cast array data from Supabase response
 */
export function safeCastArray<T>(data: any): T[] {
  if (!data || !Array.isArray(data)) return [];
  return data as T[];
}

/**
 * Type-safe way to prepare data for update operations
 */
export function prepareForUpdate<T>(data: Record<string, any>): any {
  // Cast to any to bypass TypeScript strictness with Supabase
  return data as any;
}

/**
 * Type-safe way to prepare data for insert operations
 */
export function prepareForInsert<T>(data: Record<string, any>): any {
  // Cast to any to bypass TypeScript strictness with Supabase
  return data as any;
}

/**
 * Type-safe table name for working with supabase functions
 */
export function safeTableName(table: string): any {
  return table as any;
}

/**
 * Type-safe column name for working with supabase functions
 */
export function safeColumnName(column: string): any {
  return column as any;
}


import { PostgrestError } from '@supabase/supabase-js';

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

// Helper to format UUID for Supabase queries (removes hyphens)
export function uuidFilter(id: string | null | undefined): string {
  if (!id) return '';
  return id.replace(/-/g, '');
}

// Helper to return a safer UUID format for filtering
export function toFilterableUUID(id: string | null | undefined): string {
  if (!id) return '';
  return id.toString();
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

// Helper to safely use .eq() method with UUID strings
export function safeEq(query: any, field: string, value: string | null | undefined): any {
  if (!value) return query;
  return query.eq(field, toFilterableUUID(value));
}

// Helper to safely handle data with potential errors
export function safeDataAccess<T = any>(data: any, fallback: T): T {
  if (data === null || data === undefined || 
      (typeof data === 'object' && 'error' in data)) {
    return fallback;
  }
  return data as T;
}

// Helper for safely typing Supabase queries
export function processSupabaseData<T>(result: { data: any, error: PostgrestError | null }): T | null {
  if (result.error) {
    console.error('Supabase query error:', result.error);
    return null;
  }
  return result.data as T;
}

// Determine if result is an error
export function isSupabaseError(result: any): boolean {
  return result && typeof result === 'object' && 'error' in result && result.error !== null;
}

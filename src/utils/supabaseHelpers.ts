
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

// Helper to check if a response contains data and no error
export function isDataResponse<T = any>(response: { data: T | null, error: PostgrestError | null }): response is { data: T, error: null } {
  return response.data !== null && response.error === null;
}

// Helper to format UUID for Supabase queries
export function uuidFilter(id: string): string {
  return id.replace(/-/g, '');
}

// Helper to return a safer UUID format for filtering
export function toFilterableUUID(id: string | null | undefined): string {
  if (!id) return '';
  return id.replace(/-/g, '');
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

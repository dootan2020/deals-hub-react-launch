
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Type guard to check if a response contains data and not an error
 */
export function isDataResponse<T>(response: { data: T | null; error: PostgrestError | null }): response is { data: T; error: null } {
  return response.error === null && response.data !== null;
}

/**
 * Type guard to check if an object is not null and is a record
 */
export function isRecord(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === 'object';
}

/**
 * Type guard for safely working with arrays returned from Supabase
 */
export function isValidArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Safely cast a possibly null UUID string to a string
 */
export function safeUUID(uuid: string | null | undefined): string {
  if (!uuid) return '';
  return String(uuid);
}

/**
 * Safely convert any value to a string
 */
export function safeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

/**
 * Safely convert any value to a number
 */
export function safeNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}


import { PostgrestError } from '@supabase/supabase-js';

/**
 * Type guard: checks if an object is a Supabase record (not an error).
 */
export function isSupabaseRecord<T = Record<string, any>>(record: unknown): record is T {
  return typeof record === 'object' && record !== null && !('error' in (record as any));
}

/**
 * Type guard: checks if an object has the shape of a record with string keys.
 */
export function isValidRecord<T = Record<string, any>>(value: unknown): value is T {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Type guard: checks if a value is a valid array */
export function isValidArray<T>(val: unknown): val is T[] {
  return Array.isArray(val);
}

/** Type guard: checks if a Supabase response has data and no error */
export function isDataResponse<T>(response: { data: T | null, error: PostgrestError | null }): response is { data: T, error: null } {
  return response && response.error === null && response.data !== null;
}

/** Safe cast to string */
export function safeString(val: unknown): string {
  return typeof val === 'string' ? val : (val !== null && val !== undefined ? String(val) : '');
}

/** Safe cast to number */
export function safeNumber(val: unknown): number {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
}

/** Safe cast to boolean */
export function safeBoolean(val: unknown): boolean {
  if (typeof val === 'boolean') return val;
  if (val === 'true' || val === 1 || val === '1') return true;
  return false;
}

/** Safe cast to UUID string */
export function safeUUID(val: unknown): string {
  if (typeof val === 'string' && 
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
    return val;
  }
  return '';
}

/** Helper to safely access properties with fallbacks */
export function safeProp<T>(obj: unknown, prop: string, defaultVal: T): T {
  if (obj && typeof obj === 'object' && prop in obj) {
    const val = (obj as any)[prop];
    return val !== null && val !== undefined ? val : defaultVal;
  }
  return defaultVal;
}

/** Type guard for Deposit objects */
export function isDeposit(item: any): item is import('@/types/deposits').Deposit {
  return isValidRecord(item)
    && typeof item.id === 'string'
    && typeof item.amount !== 'undefined'
    && typeof item.status === 'string'
    && typeof item.user_id === 'string';
}

/** Type guard for Order objects */
export function isOrder(item: any): item is {
  id: string;
  user_id: string;
  created_at: string;
  status: string;
  external_order_id?: string;
  total_price: number;
} {
  return isValidRecord(item)
    && typeof item.id === 'string'
    && typeof item.user_id === 'string'
    && typeof item.created_at === 'string'
    && typeof item.status === 'string'
    && (typeof item.total_price === 'number' || typeof item.total_price === 'string');
}

/** Generic record typescript check */
export function isRecord(obj: unknown): obj is Record<string, unknown> {
  return isValidRecord(obj);
}


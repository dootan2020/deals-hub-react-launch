
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Type guard: kiểm tra phản hồi có data và không error.
 */
export function isDataResponse<T>(response: { data: T | null; error: PostgrestError | null }): response is { data: T; error: null } {
  return response.error === null && response.data !== null;
}

/**
 * Type guard: value là object record
 */
export function isRecord(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === 'object';
}

/**
 * Type guard: value là array hợp lệ
 */
export function isValidArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Kiểm tra một item là Deposit
 */
export function isDeposit(item: any): item is import('@/types/deposits').Deposit {
  if (!item || typeof item !== 'object') return false;
  return (
    typeof item.id === 'string'
    && typeof item.amount !== 'undefined'
    && typeof item.status === 'string'
    && typeof item.user_id === 'string'
  );
}

/**
 * Type guard: kiểu Order (optional)
 */
export function isOrder(item: any): item is {
  id: string;
  user_id: string;
  created_at: string;
  status: string;
  external_order_id?: string;
  total_price: number;
} {
  return !!item && typeof item === 'object'
    && typeof item.id === 'string'
    && typeof item.user_id === 'string'
    && typeof item.status === 'string'
    && typeof item.created_at === 'string';
}

/**
 * Safe cast UUID string
 */
export function safeUUID(uuid: string | null | undefined): string {
  if (!uuid) return '';
  return String(uuid);
}

/**
 * Safe cast bất kỳ value sang string
 */
export function safeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

/**
 * Safe cast sang number
 */
export function safeNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Helper wrapper: fetch Supabase data an toàn
 */
export async function useSafeSupabaseFetch<T>(
  promise: Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<{ data: T | null; error: PostgrestError | null }> {
  try {
    const result = await promise;
    if ('error' in result && result.error) {
      return { data: null, error: result.error };
    }
    if ('data' in result && result.data) {
      return { data: result.data, error: null };
    }
    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: 'unknown', details: '', hint: '' } };
  }
}

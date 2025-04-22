
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Type guard: kiểm tra object có dạng record với các keys thuộc string.
 */
export function isValidRecord<T = Record<string, any>>(value: unknown): value is T {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Type guard: kiểm tra một mảng có hợp lệ không */
export function isValidArray<T>(val: unknown): val is T[] {
  return Array.isArray(val);
}

/** Safe cast kiểu string */
export function safeString(val: unknown): string {
  return typeof val === 'string' ? val : (val !== null && val !== undefined ? String(val) : '');
}

/** Safe cast kiểu number */
export function safeNumber(val: unknown): number {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
}

/** Kiểm tra response Supabase dạng có data, không lỗi */
export function isDataResponse<T>(response: { data: T | null, error: PostgrestError | null }): response is { data: T, error: null } {
  return response && response.error === null && response.data !== null;
}

/** Type guard cho Deposit (giản lược, có thể mở rộng) */
export function isDeposit(item: any): item is import('@/types/deposits').Deposit {
  return isValidRecord(item)
    && typeof item.id === 'string'
    && typeof item.amount !== 'undefined'
    && typeof item.status === 'string'
    && typeof item.user_id === 'string';
}

/** Type guard cho Order (giản lược) */
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

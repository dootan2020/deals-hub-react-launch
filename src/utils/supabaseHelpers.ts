
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { Order, OrderItem } from '@/types';

/**
 * Safely casts Supabase data to a specific type, handling errors and undefined values
 */
export function castData<T>(data: any, fallback: T = {} as T): T {
  if (!data || 'error' in data) return fallback;
  return data as T;
}

/**
 * Safely casts Supabase array data to a specific type, handling errors and empty arrays
 */
export function castArrayData<T>(data: any, fallback: T[] = []): T[] {
  if (!data || 'error' in data) return fallback;
  if (!Array.isArray(data)) return fallback;
  return data as T[];
}

/**
 * Safely gets a property from an object with proper type handling
 */
export function safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K, fallback: T[K]): T[K] {
  if (!obj) return fallback;
  return obj[key] !== undefined ? obj[key] : fallback;
}

/**
 * Creates a default Order object for type safety
 */
export function createDefaultOrder(): Order {
  return {
    id: '',
    user_id: '',
    qty: 0,
    total_price: 0,
    status: 'pending'
  };
}

/**
 * Creates a default OrderItem object for type safety
 */
export function createDefaultOrderItem(): OrderItem {
  return {
    id: '',
    quantity: 0,
    price: 0
  };
}

/**
 * Prepares an ID for use in Supabase queries by converting it to the appropriate type
 * This helps with UUID type compatibility
 */
export function prepareQueryId(id: string | null | undefined): string | null {
  if (!id) return null;
  return id as string;
}

/**
 * Type-safe function to create a filter for Supabase queries
 */
export function createFilter<T>(builder: PostgrestFilterBuilder<T>, column: string, value: any): PostgrestFilterBuilder<T> {
  if (value === null || value === undefined) {
    return builder.is(column, null);
  }
  return builder.eq(column, value);
}

/**
 * Safely converts a value to a specific type for database operations
 */
export function asDbValue<T>(value: any, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  return value as T;
}

/**
 * Prepares a record for insertion into the database with proper typing
 */
export function prepareInsert<T extends Record<string, any>>(data: Partial<T>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );
}

/**
 * Prepares a record for update in the database with proper typing
 */
export function prepareUpdate<T extends Record<string, any>>(data: Partial<T>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );
}

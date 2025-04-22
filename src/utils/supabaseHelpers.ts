
import { Database } from '@/integrations/supabase/types';

type TableName = keyof Database['public']['Tables'];
type DbResult<T> = T | null;
type DbResultOk<T> = Exclude<DbResult<T>, null | undefined>;

/**
 * Safely cast data to the specified type with optional default value
 */
export function castData<T>(data: unknown, defaultValue?: T): T {
  if (!data && defaultValue !== undefined) {
    return defaultValue;
  }
  return data as T;
}

/**
 * Safely cast array data to the specified type
 */
export function castArrayData<T>(data: unknown[] | null): T[] {
  if (!data) {
    return [];
  }
  return data as T[];
}

/**
 * Safely get a property from a database result
 */
export function safeGet<T, K extends keyof T>(
  obj: DbResult<T>,
  key: K,
  defaultValue?: T[K]
): T[K] | undefined {
  if (!obj) return defaultValue;
  return obj[key] ?? defaultValue;
}

/**
 * Prepare a filter value for Supabase query
 */
export function prepareFilter<T>(value: T): T {
  if (typeof value === 'string') {
    // Ensure string values are properly typed for Supabase filters
    return value as T;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString() as unknown as T;
  }
  return value;
}

/**
 * Prepare an object for Supabase table insertion by removing unwanted fields
 */
export function prepareInsert<T extends Record<string, any>>(object: T): T {
  const result = { ...object };
  // Remove any keys that would cause issues with Supabase insertion
  delete result.id; // Let Supabase generate the ID
  delete result.created_at; // Let Supabase set the created_at
  delete result.updated_at; // Let Supabase set the updated_at
  return result;
}

/**
 * Prepare an object for Supabase table update by removing unwanted fields
 */
export function prepareUpdate<T extends Record<string, any>>(object: T): Partial<T> {
  const result = { ...object };
  // Remove any keys that would cause issues with Supabase updating
  delete result.id; // Don't update the ID
  delete result.created_at; // Don't update the created_at
  delete result.updated_at; // Let Supabase handle updated_at
  return result;
}

/**
 * Prepare a query ID for Supabase
 */
export function prepareQueryId(id: string): string {
  return id;
}

/**
 * Creates default settings for proxy
 */
export function createDefaultProxySettings(): {
  id: string;
  proxy_type: string;
  custom_url: string | null;
  created_at: string;
  updated_at: string;
} {
  return {
    id: '',
    proxy_type: 'allorigins',
    custom_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Type safe wrapper for Supabase row level insertion
 */
export function prepareRowLevelData<T extends Record<string, any>>(
  data: T,
  userId: string
): T & { user_id: string } {
  return {
    ...prepareInsert(data),
    user_id: userId,
  };
}


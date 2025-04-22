
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

/**
 * Helper utilities for working with Supabase and TypeScript
 * to solve common type issues and provide safer data access
 */

/**
 * Safely cast any database result to your expected type
 * @param data The data returned from Supabase query
 * @param defaultValue Optional default value if data is null/undefined
 * @returns The data cast to your expected type
 */
export function castData<T>(data: any, defaultValue: T | null = null): T {
  if (!data) return defaultValue as T;
  return data as T;
}

/**
 * Cast array data returned from Supabase to an array of your expected type
 * @param data The data array returned from Supabase
 * @param defaultValue Optional default empty array if data is null/undefined
 * @returns The data array cast to your expected type
 */
export function castArrayData<T>(data: any, defaultValue: T[] = []): T[] {
  if (!data) return defaultValue;
  return data as T[];
}

/**
 * Safely access a property from a potentially undefined object
 * @param obj The object to access property from
 * @param key The property key to access
 * @param defaultValue Optional default value if property doesn't exist
 * @returns The property value or default
 */
export function safeGet<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  defaultValue: T[K] | null = null
): T[K] {
  if (!obj) return defaultValue as T[K];
  return (obj[key] !== undefined ? obj[key] : defaultValue) as T[K];
}

/**
 * Prepare ID for Supabase query to avoid type errors with .eq() method
 * @param id The ID to prepare for query
 * @returns The ID cast to any type to satisfy TypeScript
 */
export function prepareQueryId(id: string | number | undefined | null): any {
  return id as any;
}

/**
 * Create a safe wrapper for Supabase single() query to handle type errors
 * @param query The Supabase query to execute
 * @returns A promise with the properly typed result
 */
export async function safeSingleQuery<T>(query: any): Promise<{ data: T | null; error: any }> {
  try {
    const { data, error } = await query.single();
    return { data: data as T, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Prepare data object for insert/update operations to match the expected schema
 * @param data The data object to prepare
 * @returns The prepared data object cast to any to satisfy TypeScript
 */
export function prepareDataForInsert<T>(data: T): any {
  return data as any;
}

/**
 * Type guard to check if the Supabase result has an error
 * @param result The result object from Supabase query
 * @returns Boolean indicating if there's an error
 */
export function hasSupabaseError(result: { error: any }): boolean {
  return !!result.error;
}

/**
 * Extract error message from Supabase error object
 * @param error The error object from Supabase
 * @returns A readable error message
 */
export function extractErrorMessage(error: any): string {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.error_description) return error.error_description;
  return JSON.stringify(error);
}

/**
 * Wrapper for Supabase select query with proper type casting
 * @param supabase The Supabase client
 * @param table The table to select from
 * @param query Additional query builder functions
 * @returns Promise with properly typed result
 */
export async function safeSelect<T>(
  supabase: SupabaseClient<Database>,
  table: string,
  query?: (queryBuilder: any) => any
): Promise<{ data: T[]; error: any }> {
  try {
    let queryBuilder = supabase.from(table).select('*');
    if (query) {
      queryBuilder = query(queryBuilder);
    }
    const { data, error } = await queryBuilder;
    return { data: castArrayData<T>(data), error };
  } catch (error) {
    return { data: [], error };
  }
}

/**
 * Type-safe wrapper for Supabase insert operation
 * @param supabase The Supabase client
 * @param table The table to insert into
 * @param data The data to insert
 * @returns Promise with the insert result
 */
export async function safeInsert<T, R>(
  supabase: SupabaseClient<Database>,
  table: string,
  data: T
): Promise<{ data: R | null; error: any }> {
  try {
    const { data: result, error } = await supabase.from(table).insert(prepareDataForInsert(data));
    return { data: result as unknown as R, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Type-safe wrapper for Supabase update operation
 * @param supabase The Supabase client
 * @param table The table to update
 * @param data The data to update
 * @param matchColumn The column to match for update
 * @param matchValue The value to match for update
 * @returns Promise with the update result
 */
export async function safeUpdate<T, R>(
  supabase: SupabaseClient<Database>,
  table: string,
  data: T,
  matchColumn: string,
  matchValue: any
): Promise<{ data: R | null; error: any }> {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(prepareDataForInsert(data))
      .eq(matchColumn, prepareQueryId(matchValue));
    return { data: result as unknown as R, error };
  } catch (error) {
    return { data: null, error };
  }
}

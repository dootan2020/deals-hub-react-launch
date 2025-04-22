
/**
 * Utility functions for working with Supabase data types
 */

/**
 * Safely casts data to a specified type with optional default value
 * @param data The data to cast
 * @param defaultValue Optional default value if data is null or undefined
 * @returns The cast data
 */
export function castData<T>(data: any, defaultValue: any = null): T {
  if (data === null || data === undefined) {
    return defaultValue as T;
  }
  return data as T;
}

/**
 * Safely casts an array of data to a specified type
 * @param data The array data to cast
 * @returns The cast array data
 */
export function castArrayData<T>(data: any[]): T[] {
  if (!Array.isArray(data)) {
    return [] as T[];
  }
  return data as T[];
}

/**
 * Prepares a query ID for use with Supabase
 * @param id The ID to prepare
 * @returns The prepared ID
 */
export function prepareQueryId(id: string | null | undefined): string {
  if (!id) return '';
  return id.toString();
}

/**
 * Prepares an object for update with Supabase
 * @param obj The object to prepare
 * @returns The prepared object
 */
export function prepareUpdate(obj: Record<string, any>): Record<string, any> {
  return { ...obj };
}

/**
 * Prepares an object for insert with Supabase
 * @param obj The object to prepare
 * @returns The prepared object
 */
export function prepareInsert(obj: Record<string, any>): Record<string, any> {
  return { ...obj };
}

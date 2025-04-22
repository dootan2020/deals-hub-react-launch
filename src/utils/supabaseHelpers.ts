
/**
 * Helper functions for working with Supabase data
 */

/**
 * Safely cast data to the specified type
 * @param data Data to cast
 * @param defaultValue Default value to use if data is null or undefined
 * @returns The data cast to the specified type
 */
export function castData<T>(data: any, defaultValue?: T): T {
  if (!data && defaultValue) {
    return defaultValue;
  }
  return data as T;
}

/**
 * Safely cast array data to the specified type
 * @param data Array data to cast
 * @returns The array data cast to the specified type
 */
export function castArrayData<T>(data: any[] | null): T[] {
  if (!data) {
    return [];
  }
  return data as T[];
}

/**
 * Prepare an object for insertion into a Supabase table
 * @param object Object to prepare for insertion
 * @returns Object prepared for insertion
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
 * Prepare an object for updating a Supabase table
 * @param object Object to prepare for updating
 * @returns Object prepared for updating
 */
export function prepareUpdate<T extends Record<string, any>>(object: T): Partial<T> {
  const result = { ...object };
  // Remove any keys that would cause issues with Supabase updating
  delete result.id; // Don't update the ID
  delete result.created_at; // Don't update the created_at
  delete result.updated_at; // Let Supabase set the updated_at
  return result;
}

/**
 * Creates default proxy settings
 * @returns Default proxy settings
 */
export function createDefaultProxySettings(): ProxySettings {
  return {
    id: '',
    proxy_type: 'allorigins',
    custom_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Prepare a query ID for Supabase
 * @param id ID to prepare
 * @returns Prepared ID
 */
export function prepareQueryId(id: string): string {
  return id;
}

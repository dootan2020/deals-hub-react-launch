
/**
 * Utility functions for working with database types
 */

/**
 * Prepares a table ID for use with Supabase
 * @param tableName The table name
 * @param id The ID to prepare
 * @returns The prepared ID
 */
export function prepareTableId(tableName: string, id: string | null | undefined): string {
  if (!id) return '';
  return id.toString();
}

/**
 * Prepares an object for update with Supabase for a specific table
 * @param tableName The table name
 * @param obj The object to prepare
 * @returns The prepared object
 */
export function prepareTableUpdate(tableName: string, obj: Record<string, any>): Record<string, any> {
  return { ...obj };
}

/**
 * Prepares an object for insert with Supabase for a specific table
 * @param tableName The table name
 * @param obj The object to prepare
 * @returns The prepared object
 */
export function prepareTableInsert(tableName: string, obj: Record<string, any>): Record<string, any> {
  return { ...obj };
}

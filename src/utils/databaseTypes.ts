
/**
 * Helper functions for type-safe database ID handling
 */

/**
 * Prepares a table ID for use with Supabase
 * Ensures consistent type handling across the application
 */
export function prepareTableId(tableName: string, id: string): string {
  return id;
}

/**
 * Prepares an object for insertion into a Supabase table
 * Ensures consistent type handling across the application
 */
export function prepareTableInsert(tableName: string, data: Record<string, any>): Record<string, any> {
  return data;
}

/**
 * Prepares an object for updating a Supabase table
 * Ensures consistent type handling across the application
 */
export function prepareTableUpdate(tableName: string, data: Record<string, any>): Record<string, any> {
  return data;
}

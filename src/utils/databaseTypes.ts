
import { Database } from '@/integrations/supabase/types';

type SchemaName = keyof Database;
type TableName<S extends SchemaName = 'public'> = keyof Database[S]['Tables'];

/**
 * Helper for table ID handling
 */
export function prepareTableId<
  S extends SchemaName = 'public',
  T extends TableName<S> = TableName<S>
>(tableName: T, id: string): string {
  // Ensure consistent ID handling across the application
  return id;
}

/**
 * Helper for table insert preparation
 */
export function prepareTableInsert<
  S extends SchemaName = 'public',
  T extends TableName<S> = TableName<S>
>(tableName: T, data: Record<string, any>): Record<string, any> {
  // Remove system fields and ensure data conforms to table schema
  const { id, created_at, updated_at, ...rest } = data;
  return rest;
}

/**
 * Helper for table update preparation
 */
export function prepareTableUpdate<
  S extends SchemaName = 'public',
  T extends TableName<S> = TableName<S>
>(tableName: T, data: Record<string, any>): Record<string, any> {
  // Remove system fields for update operations
  const { id, created_at, updated_at, ...rest } = data;
  return rest;
}


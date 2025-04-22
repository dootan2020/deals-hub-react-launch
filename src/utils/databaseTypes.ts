
import { Database } from '@/types/database.types';

/**
 * Helper function to safely cast database data types
 * when working with Supabase tables
 * 
 * @param tableName The name of the table in the database
 * @param id The ID to compare with
 * @returns The ID in the correct format for Supabase queries
 */
export function prepareTableId<T extends keyof Database['public']['Tables']>(
  tableName: T,
  id: string
): string {
  return id;
}

/**
 * Helper type for getting row type from a specific table
 */
export type TableRow<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

/**
 * Helper type for getting insert type from a specific table
 */
export type TableInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];

/**
 * Helper type for getting update type from a specific table
 */
export type TableUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

/**
 * Helper function to prepare data for insertion into a specific table
 */
export function prepareTableInsert<T extends keyof Database['public']['Tables']>(
  data: Partial<TableInsert<T>>
): TableInsert<T> {
  return data as TableInsert<T>;
}

/**
 * Helper function to prepare data for updating a specific table
 */
export function prepareTableUpdate<T extends keyof Database['public']['Tables']>(
  data: Partial<TableUpdate<T>>
): TableUpdate<T> {
  return data as TableUpdate<T>;
}


/**
 * Fixed types for the application
 * These types are used for strongly-typed access to database types
 */

// For use with RPC calls that return specific types
export interface DepositStatusRPCResponse {
  total_pending: number;
  needs_retry: number;
  processed_today: number;
  failed_today: number;
}

// For use with Supabase API helper functions
export type DatabaseId = string;

export type SafeString = string;

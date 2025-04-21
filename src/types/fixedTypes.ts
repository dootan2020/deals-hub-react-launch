
import { Product } from './index';

/**
 * Minimal representation of a product that can be used for purchase
 * Contains only essential fields needed for purchase operations
 */
export interface MinimalProduct {
  id: string;
  title: string;
  price: number;
  description: string;
  stock: number;
  kiosk_token: string;
}

/**
 * Used for cases where we need to create a product with only some fields
 */
export type PartialProduct = Partial<Product>;

/**
 * Result from idempotency processing without recursive type issues
 */
export interface IdempotencyResult<T> {
  result: T | null;
  isNew: boolean;
  error?: string;
}

/**
 * Strongly typed RPC response structure for deposit status
 */
export interface DepositStatusRPCResponse {
  total_pending: number;
  needs_retry: number;
  processed_today: number;
  failed_today: number;
}

/**
 * Response structure for transaction processing
 */
export interface TransactionProcessResult {
  success: boolean;
  processed: number;
  failed: number;
  error?: string;
  depositIds?: string[];
}

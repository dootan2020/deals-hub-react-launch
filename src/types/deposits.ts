
export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  net_amount: number;
  transaction_id: string | null;
  payment_method: string;
  status: string;
  payer_email: string | null;
  payer_id: string | null;
  created_at: string;
  updated_at: string;
  is_processed?: boolean;
  process_attempts?: number;
  last_attempt_at?: string;
  idempotency_key?: string;
}

// Return type for get_pending_deposits_status RPC function
export interface PendingDepositsStatus {
  total_pending: number;
  needs_retry: number;
  processed_today: number;
  failed_today: number;
}

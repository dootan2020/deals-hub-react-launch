
export interface Deposit {
  id: string;
  amount: number;
  net_amount: number;
  status: string;
  user_id: string;
  payer_id?: string;
  payer_email?: string;
  transaction_id?: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  idempotency_key?: string;
}

export interface PendingDepositsStatus {
  total_pending: number;
  needs_retry: number;
  processed_today: number;
  failed_today: number;
}


/**
 * Interface representing a deposit in the system
 */
export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  net_amount: number;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  transaction_id?: string;
  payer_id?: string;
  payer_email?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Status of pending deposits in the system
 */
export interface PendingDepositsStatus {
  total_pending: number;
  needs_retry: number;
  processed_today: number;
  failed_today: number;
}

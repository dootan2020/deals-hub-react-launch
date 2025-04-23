
// RPC types for Supabase functions

export interface BalanceUpdateResult {
  success: boolean;
  new_balance?: number;
  error?: string;
}

export interface OrderCheckResult {
  success: boolean;
  status?: string;
  data?: any;
  error?: string;
}

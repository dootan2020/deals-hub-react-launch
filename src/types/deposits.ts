
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
}

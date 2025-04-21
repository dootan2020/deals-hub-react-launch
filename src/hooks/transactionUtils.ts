
// Shared types/utilities for transactions

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  status: string;
  type: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    display_name?: string;
  } | null;
}

export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  net_amount?: number;
  payment_method: string;
  status: string;
  transaction_id?: string;
  payer_email?: string | null;
  payer_id?: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    display_name?: string;
  } | null;
}

/** Normalize "user" returned from Supabase SQL result to match type expectations. */
export function normalizeUserField(user: any): { email: string; display_name?: string } {
  if (
    user &&
    typeof user === 'object' &&
    user !== null &&
    !('error' in user) &&
    typeof user.email === 'string'
  ) {
    return user as { email: string; display_name?: string };
  }
  return { email: 'N/A' };
}

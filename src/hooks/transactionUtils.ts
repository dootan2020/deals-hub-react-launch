
// Helper to normalize user field from supabase join
export const normalizeUserField = (userData: any): string => {
  if (!userData) return '';
  
  if (typeof userData === 'string') {
    return userData;
  }
  
  // If it's an object, assume it has an email property
  if (typeof userData === 'object' && userData.email) {
    return userData.email;
  }
  
  return '';
};

export interface Transaction {
  id: string;
  user_id: string;
  user?: string; // This will store the normalized user email
  amount: number;
  type: string;
  status: string;
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface Deposit {
  id: string;
  user_id: string;
  user?: string; // This will store the normalized user email
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

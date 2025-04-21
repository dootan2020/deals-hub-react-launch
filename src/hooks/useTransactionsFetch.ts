
import { supabase } from '@/integrations/supabase/client';
import { normalizeUserField, Transaction } from './transactionUtils';

// Fetch all transactions and normalize user fields
export async function fetchTransactionsData(): Promise<Transaction[]> {
  const { data, error: transactionsError } = await supabase
    .from('transactions')
    .select(`
      *,
      user:user_id(email)
    `)
    .order('created_at', { ascending: false });

  if (transactionsError) throw transactionsError;

  const typedTransactions = (data || []).map((item: any) => {
    const userValue = normalizeUserField(item.user || null);
    return { ...item, user: userValue } as Transaction;
  });

  return typedTransactions;
}


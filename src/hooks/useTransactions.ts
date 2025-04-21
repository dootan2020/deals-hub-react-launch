
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Transaction, normalizeUserField } from './transactionUtils';

// Hook for list of transactions (not deposits)
export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          user:user_id(email)
        `)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      const typedTransactions = (data || []).map((item: any) => {
        const userValue = normalizeUserField(item.user);
        return { ...item, user: userValue } as Transaction;
      });

      setTransactions(typedTransactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Không thể tải danh sách giao dịch');
      toast.error("Lỗi", "Không thể tải danh sách giao dịch");
    } finally {
      setLoading(false);
    }
  };

  return { transactions, loading, error, fetchTransactions, setTransactions };
}

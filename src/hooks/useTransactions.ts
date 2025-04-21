
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
  } | null; // Made nullable to handle potential missing user data
}

export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  net_amount?: number;
  payment_method: string;
  status: string;
  transaction_id?: string;
  payer_email?: string;
  payer_id?: string;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    display_name?: string;
  } | null; // Made nullable to handle potential missing user data
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
    fetchDeposits();
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

      // Type casting to ensure compatibility with Transaction interface
      const typedTransactions = (data || []).map(item => {
        // Handle potentially missing user data
        const userValue = item.user && typeof item.user === 'object' && !('error' in item.user) 
          ? item.user 
          : { email: 'N/A' };
          
        return {
          ...item,
          user: userValue
        } as Transaction;
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

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: depositsError } = await supabase
        .from('deposits')
        .select(`
          *,
          user:user_id(email)
        `)
        .order('created_at', { ascending: false });

      if (depositsError) throw depositsError;

      // Type casting to ensure compatibility with Deposit interface
      const typedDeposits = (data || []).map(item => {
        // Handle potentially missing user data
        const userValue = item.user && typeof item.user === 'object' && !('error' in item.user) 
          ? item.user 
          : { email: 'N/A' };
          
        return {
          ...item,
          user: userValue
        } as Deposit;
      });

      setDeposits(typedDeposits);
    } catch (err) {
      console.error('Error fetching deposits:', err);
      setError('Không thể tải danh sách nạp tiền');
      toast.error("Lỗi", "Không thể tải danh sách nạp tiền");
    } finally {
      setLoading(false);
    }
  };

  const updateDepositStatus = async (depositId: string, newStatus: string): Promise<void> => {
    try {
      setLoading(true);
      
      const { data: deposit, error: getError } = await supabase
        .from('deposits')
        .select('*')
        .eq('id', depositId)
        .maybeSingle();
        
      if (getError) throw getError;
      if (!deposit) throw new Error('Deposit not found');
      
      // Update the deposit status
      const { error: updateError } = await supabase
        .from('deposits')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', depositId);
        
      if (updateError) throw updateError;
      
      // If approving (completed), update the user's balance
      if (newStatus === 'completed') {
        const { error: balanceError } = await supabase.rpc(
          'update_user_balance',
          {
            user_id_param: deposit.user_id,
            amount_param: deposit.amount
          }
        );
        
        if (balanceError) throw balanceError;
        
        // Create a transaction record
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: deposit.user_id,
            amount: deposit.amount,
            payment_method: deposit.payment_method,
            status: 'completed',
            type: 'deposit',
            transaction_id: deposit.transaction_id
          });
          
        if (transactionError) throw transactionError;
      }
      
      // Update local state
      setDeposits(deposits.map(d => 
        d.id === depositId ? { ...d, status: newStatus, updated_at: new Date().toISOString() } : d
      ));
      
      await fetchTransactions();
      
    } catch (err) {
      console.error('Error updating deposit status:', err);
      toast.error("Lỗi", "Không thể cập nhật trạng thái nạp tiền");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    transactions,
    deposits,
    loading,
    error,
    fetchTransactions,
    fetchDeposits,
    updateDepositStatus
  };
}

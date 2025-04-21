
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Deposit, normalizeUserField } from './transactionUtils';

// Hook for deposit state, fetching, and admin update
export function useDeposits() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDeposits();
  }, []);

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

      const typedDeposits = (data || []).map((item: any) => {
        const userValue = normalizeUserField(item.user || null);
        return { ...item, user: userValue } as Deposit;
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

  // Update a deposit's status and trigger account update and transaction entry.
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

      setDeposits(deposits.map(d =>
        d.id === depositId ? { ...d, status: newStatus, updated_at: new Date().toISOString() } : d
      ));
    } catch (err) {
      console.error('Error updating deposit status:', err);
      toast.error("Lỗi", "Không thể cập nhật trạng thái nạp tiền");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    deposits,
    loading,
    error,
    fetchDeposits,
    updateDepositStatus,
    setDeposits,
  };
}

export { Deposit } from './transactionUtils';

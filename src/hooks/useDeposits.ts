
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Deposit, normalizeUserField } from './transactionUtils';
import { 
  extractSafeData, 
  prepareForUpdate, 
  prepareForInsert 
} from '@/utils/supabaseHelpers';
import { prepareQueryParam } from '@/utils/supabaseTypeUtils';

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

      const depositResult = await supabase
        .from('deposits')
        .select('*')
        .eq('id', prepareQueryParam(depositId))
        .maybeSingle();

      if (depositResult.error) throw depositResult.error;
      
      const deposit = extractSafeData<Deposit>(depositResult);
      if (!deposit) throw new Error('Deposit not found');

      const updateData = prepareForUpdate({
        status: newStatus,
        updated_at: new Date().toISOString()
      });

      const updateResult = await supabase
        .from('deposits')
        .update(updateData)
        .eq('id', prepareQueryParam(depositId));

      if (updateResult.error) throw updateResult.error;

      // If approving (completed), update the user's balance
      if (newStatus === 'completed' && deposit.user_id && deposit.amount) {
        const { error: balanceError } = await supabase.rpc(
          'update_user_balance',
          {
            user_id_param: deposit.user_id,
            amount_param: deposit.amount
          }
        );

        if (balanceError) throw balanceError;

        // Create a transaction record
        const transactionData = prepareForInsert({
          user_id: deposit.user_id,
          amount: deposit.amount,
          payment_method: deposit.payment_method,
          status: 'completed',
          type: 'deposit',
          transaction_id: deposit.transaction_id
        });

        const { error: transactionError } = await supabase
          .from('transactions')
          .insert(transactionData);

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

// Use export type for re-exports when isolatedModules is enabled
export type { Deposit } from './transactionUtils';

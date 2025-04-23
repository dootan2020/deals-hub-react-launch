
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Deposit, normalizeUserField } from './transactionUtils';
import { extractSafeData } from '@/utils/helpers';

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
      setError('Could not load deposit list');
      toast.error("Error", "Could not load deposit list");
    } finally {
      setLoading(false);
    }
  };

  // Update a deposit's status
  const updateDepositStatus = async (depositId: string, newStatus: string): Promise<void> => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .eq('id', depositId)
        .single();

      if (error) throw error;
      
      if (!data) throw new Error('Deposit not found');

      const updateResult = await supabase
        .from('deposits')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', depositId);

      if (updateResult.error) throw updateResult.error;

      // If approving (completed), update the user's balance
      if (newStatus === 'completed' && data.user_id && data.amount) {
        const { error: balanceError } = await supabase.rpc(
          'update_user_balance',
          {
            user_id_param: data.user_id,
            amount_param: data.amount
          }
        );

        if (balanceError) throw balanceError;

        // Create a transaction record
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: data.user_id,
            amount: data.amount,
            payment_method: data.payment_method,
            status: 'completed',
            type: 'deposit',
            transaction_id: data.transaction_id
          });

        if (transactionError) throw transactionError;
      }

      setDeposits(deposits.map(d =>
        d.id === depositId ? { ...d, status: newStatus, updated_at: new Date().toISOString() } : d
      ));
    } catch (err) {
      console.error('Error updating deposit status:', err);
      toast.error("Error", "Could not update deposit status");
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

export { type Deposit };

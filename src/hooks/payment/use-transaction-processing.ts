
import { supabase } from '@/integrations/supabase/client';

// Process a deposit transaction
export const processDepositBalance = async (depositId: string) => {
  try {
    // In a real app, this would communicate with the backend
    console.log(`Processing deposit: ${depositId}`);
    return {
      success: true,
      updated: true
    };
  } catch (error) {
    console.error('Error processing deposit:', error);
    return {
      success: false,
      error: 'Failed to process deposit'
    };
  }
};

// Create a transaction record
export const createTransactionRecord = async (
  userId: string,
  amount: number,
  type = 'deposit'
) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount,
        type,
        status: 'completed'
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return {
      success: false,
      error: 'Failed to create transaction record'
    };
  }
};

// Update user balance
export const updateUserBalance = async (userId: string, amount: number) => {
  try {
    const { error } = await supabase.rpc(
      'update_user_balance',
      {
        user_id_param: userId,
        amount_param: amount
      }
    );

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating user balance:', error);
    return {
      success: false,
      error: 'Failed to update user balance'
    };
  }
};

export const useTransactionProcessing = () => {
  return {
    processDepositBalance,
    createTransactionRecord,
    updateUserBalance
  };
};

export default useTransactionProcessing;

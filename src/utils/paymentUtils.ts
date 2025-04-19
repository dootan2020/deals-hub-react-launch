
import { supabase } from '@/integrations/supabase/client';

/**
 * Calculate the PayPal fee for a given amount
 * @param amount The amount to calculate the fee for
 * @returns The PayPal fee
 */
export const calculateFee = (amount: number): number => {
  if (isNaN(amount) || amount <= 0) return 0;
  
  const feePercentage = 0.039;
  const fixedFee = 0.30;
  return Number((amount * feePercentage + fixedFee).toFixed(2));
};

/**
 * Calculate the net amount after PayPal fee
 * @param amount The gross amount
 * @returns The net amount after PayPal fee
 */
export const calculateNetAmount = (amount: number): number => {
  if (isNaN(amount) || amount <= 0) return 0;
  
  return Number((amount - calculateFee(amount)).toFixed(2));
};

/**
 * Create a deposit record in the database
 * @param userId The user ID
 * @param grossAmount The gross amount
 * @returns The ID of the created deposit record and success status
 */
export const createDepositRecord = async (
  userId: string, 
  grossAmount: number
): Promise<{ id: string | null, success: boolean, error?: string }> => {
  try {
    console.log(`Creating deposit record for user: ${userId}, amount: $${grossAmount}`);
    
    if (isNaN(grossAmount) || grossAmount < 1) {
      console.error("Invalid deposit amount", grossAmount);
      return { id: null, success: false, error: "Invalid deposit amount" };
    }
    
    if (!userId) {
      console.error("Missing user ID for deposit");
      return { id: null, success: false, error: "Missing user ID" };
    }
    
    const netAmount = calculateNetAmount(grossAmount);
    console.log(`Calculated net amount: $${netAmount} (after fee)`);
    
    const { data, error: insertError } = await supabase
      .from('deposits')
      .insert({
        user_id: userId,
        amount: grossAmount,
        net_amount: netAmount,
        payment_method: 'paypal',
        status: 'pending'
      })
      .select('id')
      .single();

    if (insertError) {
      console.error("Error creating deposit record:", insertError);
      
      // More descriptive error message for RLS violations
      if (insertError.message?.includes('row-level security')) {
        return { 
          id: null, 
          success: false, 
          error: "Authorization error: Please ensure you're logged in" 
        };
      }
      
      return { id: null, success: false, error: insertError.message };
    }
    
    console.log("Deposit record created successfully with ID:", data.id);
    return { id: data.id, success: true };
    
  } catch (error) {
    console.error("Exception in createDepositRecord:", error);
    return { 
      id: null, 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error creating deposit" 
    };
  }
};

/**
 * Update a deposit record with a transaction ID
 * @param depositId The deposit ID
 * @param transactionId The transaction ID
 * @returns Whether the update was successful and any error message
 */
export const updateDepositWithTransaction = async (
  depositId: string, 
  transactionId: string
): Promise<{ success: boolean, error?: string }> => {
  try {
    console.log(`Updating deposit ${depositId} with transaction ID: ${transactionId}`);
    
    if (!depositId || !transactionId) {
      console.error("Missing required parameters", { depositId, transactionId });
      return { success: false, error: "Missing deposit ID or transaction ID" };
    }
    
    // Update the deposit with transaction ID and set status to completed
    const { error } = await supabase
      .from('deposits')
      .update({
        transaction_id: transactionId,
        status: 'completed' // Auto-complete deposits when transaction ID is set
      })
      .eq('id', depositId);

    if (error) {
      console.error("Error updating deposit record:", error);
      return { success: false, error: error.message };
    }
    
    // Try to update user balance for this deposit
    await processDepositBalance(depositId);
    
    console.log("Deposit record updated and balance updated successfully");
    return { success: true };
  } catch (error) {
    console.error("Exception in updateDepositWithTransaction:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error updating deposit" 
    };
  }
};

/**
 * Ensure deposit is processed and user balance is updated
 * @param depositId The deposit ID 
 * @returns Success status and any error
 */
export const processDepositBalance = async (
  depositId: string
): Promise<{ success: boolean, error?: string }> => {
  try {
    // Get deposit details
    const { data: deposit, error } = await supabase
      .from('deposits')
      .select('id, user_id, net_amount, status, transaction_id')
      .eq('id', depositId)
      .single();
      
    if (error) {
      console.error("Error fetching deposit:", error);
      return { success: false, error: error.message };
    }
    
    if (!deposit) {
      return { success: false, error: "Deposit not found" };
    }
    
    // If deposit has a transaction_id but isn't completed, mark it as completed
    if (deposit.transaction_id && deposit.status !== 'completed') {
      const { error: updateError } = await supabase
        .from('deposits')
        .update({ status: 'completed' })
        .eq('id', depositId);
        
      if (updateError) {
        console.error("Error updating deposit status:", updateError);
        return { success: false, error: updateError.message };
      }
    }
    
    // If deposit is completed, update balance
    if (deposit.status === 'completed' || deposit.transaction_id) {
      const { error: balanceError } = await supabase.rpc(
        'update_user_balance',
        {
          user_id_param: deposit.user_id,
          amount_param: deposit.net_amount
        }
      );
      
      if (balanceError) {
        console.error("Error updating user balance:", balanceError);
        return { success: false, error: balanceError.message };
      }
      
      return { success: true };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Exception in processDepositBalance:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error processing deposit balance" 
    };
  }
};

/**
 * Force process a specific PayPal transaction to update user balance
 * @param transactionId The PayPal transaction ID or order ID to process
 * @returns Whether the update was successful and any error message
 */
export const processSpecificTransaction = async (
  transactionId: string
): Promise<{ success: boolean, error?: string }> => {
  try {
    console.log(`Manually processing specific transaction: ${transactionId}`);
    
    if (!transactionId) {
      return { success: false, error: "Transaction ID is required" };
    }
    
    // Try first with transaction_id parameter
    const { data, error } = await supabase.functions.invoke('paypal-webhook', {
      body: { transaction_id: transactionId }
    });

    if (error) {
      console.error("Error processing transaction:", error);
      // If there was an error with the transaction_id, try with order_id
      const { data: orderData, error: orderError } = await supabase.functions.invoke('paypal-webhook', {
        body: { order_id: transactionId }
      });
      
      if (orderError) {
        console.error("Error processing order:", orderError);
        return { success: false, error: `Failed to process: ${error.message}, ${orderError.message}` };
      }
      
      console.log("Order processing result:", orderData);
      return { 
        success: orderData?.success || false, 
        error: orderData?.error || orderData?.message
      };
    }
    
    console.log("Transaction processing result:", data);
    return { 
      success: data?.success || false, 
      error: data?.error || data?.message
    };
  } catch (error) {
    console.error("Exception in processSpecificTransaction:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error processing transaction" 
    };
  }
};

/**
 * Check deposit status by transaction ID or order ID
 * @param id The transaction ID or order ID to check
 * @returns The deposit status and information
 */
export const checkDepositStatus = async (
  id: string
): Promise<{ success: boolean, status?: string, deposit?: any, error?: string }> => {
  try {
    console.log(`Checking deposit status for ID: ${id}`);
    
    if (!id) {
      return { success: false, error: "ID is required" };
    }
    
    // Try to find by transaction_id
    let { data: deposit, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('transaction_id', id)
      .maybeSingle();

    if (error) {
      console.error("Error checking deposit by transaction_id:", error);
      return { success: false, error: error.message };
    }
    
    // If found deposit with transaction_id
    if (deposit) {
      // If it has transaction_id but isn't completed, update it and the balance
      if (deposit.status !== 'completed') {
        await processDepositBalance(deposit.id);
        
        // Fetch the updated deposit
        const { data: updatedDeposit } = await supabase
          .from('deposits')
          .select('*')
          .eq('id', deposit.id)
          .single();
          
        if (updatedDeposit) {
          deposit = updatedDeposit;
        }
      }
      
      return { 
        success: true, 
        status: deposit.status,
        deposit
      };
    }
    
    // If not found by transaction_id, trigger processing
    const result = await processSpecificTransaction(id);
    return {
      success: result.success,
      status: "processed",
      error: result.error
    };
  } catch (error) {
    console.error("Exception in checkDepositStatus:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error checking deposit" 
    };
  }
};

/**
 * Find and process all pending deposits with transaction IDs
 * @returns Number of deposits processed
 */
export const processAllPendingDeposits = async (): Promise<{ count: number, success: boolean, error?: string }> => {
  try {
    // Find all deposits with transaction IDs that aren't completed yet
    const { data: deposits, error } = await supabase
      .from('deposits')
      .select('id')
      .not('transaction_id', 'is', null)
      .eq('status', 'pending');
      
    if (error) {
      console.error("Error finding pending deposits:", error);
      return { count: 0, success: false, error: error.message };
    }
    
    if (!deposits || deposits.length === 0) {
      return { count: 0, success: true };
    }
    
    // Process each deposit
    let processedCount = 0;
    for (const deposit of deposits) {
      const { success } = await processDepositBalance(deposit.id);
      if (success) processedCount++;
    }
    
    return { count: processedCount, success: true };
  } catch (error) {
    console.error("Exception in processAllPendingDeposits:", error);
    return { 
      count: 0, 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error processing pending deposits" 
    };
  }
};

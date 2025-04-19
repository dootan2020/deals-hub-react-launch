
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
    
    const { error } = await supabase
      .from('deposits')
      .update({
        transaction_id: transactionId
      })
      .eq('id', depositId);

    if (error) {
      console.error("Error updating deposit record:", error);
      return { success: false, error: error.message };
    }
    
    console.log("Deposit record updated successfully");
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
    
    // If not found by transaction_id, check the custom_id which might contain the order_id
    if (!deposit) {
      // Use supabase to get transaction by order_id from webhook logs or custom_id field
      // This implementation depends on your database schema
      console.log("Not found by transaction_id, you may need to check by order_id");
      
      // For this implementation, we'll trigger processing it in case it wasn't processed yet
      const result = await processSpecificTransaction(id);
      return {
        success: result.success,
        status: "processed",
        error: result.error
      };
    }
    
    return { 
      success: true, 
      status: deposit.status,
      deposit
    };
  } catch (error) {
    console.error("Exception in checkDepositStatus:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error checking deposit" 
    };
  }
};

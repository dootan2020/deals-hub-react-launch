
import { supabase } from '@/integrations/supabase/client';

/**
 * Force process a specific PayPal transaction to update user balance
 */
export const processSpecificTransaction = async (
  transactionId: string
): Promise<{ success: boolean, error?: string }> => {
  try {
    console.log(`Manually processing specific transaction: ${transactionId}`);
    
    if (!transactionId) {
      return { success: false, error: "Transaction ID is required" };
    }
    
    const { data, error } = await supabase.functions.invoke('paypal-webhook', {
      body: { transaction_id: transactionId }
    });

    if (error) {
      console.error("Error processing transaction:", error);
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
 */
export const checkDepositStatus = async (
  id: string
): Promise<{ success: boolean, status?: string, deposit?: any, error?: string }> => {
  try {
    console.log(`Checking deposit status for ID: ${id}`);
    
    if (!id) {
      return { success: false, error: "ID is required" };
    }
    
    let { data: deposit, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('transaction_id', id)
      .maybeSingle();

    if (error) {
      console.error("Error checking deposit by transaction_id:", error);
      return { success: false, error: error.message };
    }
    
    if (deposit) {
      if (deposit.status !== 'completed') {
        await processDepositBalance(deposit.id);
        
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


import { supabase } from '@/integrations/supabase/client';
import { processDepositBalance } from './depositProcessor';

/**
 * Force process a specific PayPal transaction to update user balance
 */
export const processSpecificTransaction = async (
  transactionId: string
): Promise<{ success: boolean, error?: string, message?: string }> => {
  try {
    console.log(`Manually processing specific transaction: ${transactionId}`);
    
    if (!transactionId) {
      return { success: false, error: "Transaction ID is required" };
    }
    
    // Added retry logic for better reliability
    let retryCount = 0;
    const maxRetries = 2;
    let lastError = null;
    
    while (retryCount <= maxRetries) {
      try {
        // First, try the new check-payment function
        const { data: checkData, error: checkError } = await supabase.functions.invoke('check-payment', {
          body: { transaction_id: transactionId }
        });
        
        if (!checkError && checkData?.success) {
          console.log("Transaction checked successfully:", checkData);
          return {
            success: true,
            message: checkData.message
          };
        }
        
        // If check-payment fails or doesn't exist, try the paypal-webhook function
        const { data, error } = await supabase.functions.invoke('paypal-webhook', {
          body: { transaction_id: transactionId }
        });

        if (error) {
          console.error("Error processing transaction:", error);
          // Try as order_id instead of transaction_id
          const { data: orderData, error: orderError } = await supabase.functions.invoke('paypal-webhook', {
            body: { order_id: transactionId }
          });
          
          if (orderError) {
            console.error("Error processing order:", orderError);
            throw new Error(`Failed to process: ${error.message}, ${orderError.message}`);
          }
          
          console.log("Order processing result:", orderData);
          return { 
            success: orderData?.success || false, 
            message: orderData?.message,
            error: orderData?.error 
          };
        }
        
        console.log("Transaction processing result:", data);
        return { 
          success: data?.success || false, 
          message: data?.message,
          error: data?.error 
        };
      } catch (retryError) {
        lastError = retryError;
        retryCount++;
        console.log(`Retry ${retryCount}/${maxRetries} failed, retrying...`, retryError);
        // Wait before retrying (exponential backoff)
        if (retryCount <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    }
    
    // If we've exhausted retries, try direct database approach
    console.log("API calls exhausted, trying direct database operation");
    const result = await processDepositBalance(transactionId);
    return {
      success: result.success,
      error: result.error
    };
    
  } catch (error) {
    console.error("Exception in processSpecificTransaction:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error processing transaction" 
    };
  }
};

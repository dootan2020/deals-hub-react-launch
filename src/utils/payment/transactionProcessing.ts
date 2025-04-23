
import { supabase } from '@/integrations/supabase/client';

export const checkDepositStatus = async (transactionId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('check-payment', {
      body: { transaction_id: transactionId }
    });
    
    if (error) {
      console.error('Error checking deposit status:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      ...data
    };
    
  } catch (error) {
    console.error('Error processing status check:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};


import { supabase } from '@/integrations/supabase/client';
import { processDepositBalance } from './depositProcessor';

/**
 * Find and process all pending deposits with transaction IDs
 */
export const processAllPendingDeposits = async (): Promise<{ count: number, success: boolean, error?: string }> => {
  try {
    console.log("Looking for pending deposits with transaction IDs");
    
    // First query: find deposits with transaction IDs that are still pending
    const { data: deposits, error } = await supabase
      .from('deposits')
      .select('id')
      .not('transaction_id', 'is', null)
      .eq('status', 'pending');
      
    if (error) {
      console.error("Error finding pending deposits:", error);
      return { count: 0, success: false, error: error.message };
    }
    
    let pendingDeposits = deposits || [];
    
    // Second query: find completed deposits that may not have had their balance updated
    // Check last 24 hours to avoid processing very old deposits
    const { data: completedDeposits, error: error2 } = await supabase
      .from('deposits')
      .select('id, user_id')
      .eq('status', 'completed')
      .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!error2 && completedDeposits) {
      // Add completed deposits to our list
      pendingDeposits = [...pendingDeposits, ...completedDeposits];
    }
    
    if (pendingDeposits.length === 0) {
      console.log("No pending or recent deposits found to process");
      return { count: 0, success: true };
    }
    
    console.log(`Found ${pendingDeposits.length} deposits to process`);
    
    let processedCount = 0;
    for (const deposit of pendingDeposits) {
      const { success, updated } = await processDepositBalance(deposit.id);
      if (success && updated) processedCount++;
    }
    
    console.log(`Successfully processed ${processedCount} deposits`);
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

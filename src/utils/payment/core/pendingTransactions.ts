
import { supabase } from '@/integrations/supabase/client';
import { processSpecificTransaction } from './transactionVerifier';
import { toast } from 'sonner';

/**
 * Process all pending transactions in the system
 */
export const processPendingTransactions = async (): Promise<{ 
  success: boolean, 
  processed: number, 
  failed: number,
  error?: string 
}> => {
  try {
    console.log("Starting to process all pending transactions");
    // Get list of pending deposits with transaction_id
    const { data, error } = await supabase
      .from('deposits')
      .select('id, transaction_id')
      .eq('status', 'pending')
      .not('transaction_id', 'is', null);

    if (error) {
      console.error("Error fetching pending deposits:", error);
      toast.error("Không thể lấy danh sách giao dịch chờ xử lý");
      return {
        success: false,
        processed: 0,
        failed: 0,
        error: error.message
      };
    }

    if (!data || data.length === 0) {
      console.log("No pending transactions found");
      toast("Không có giao dịch nào đang chờ xử lý");
      return {
        success: true,
        processed: 0,
        failed: 0
      };
    }

    console.log(`Found ${data.length} pending transactions to process`);
    let processed = 0;
    let failed = 0;

    // Process each transaction
    for (const deposit of data) {
      if (!deposit.transaction_id) continue;

      console.log(`Processing deposit ${deposit.id} with transaction ${deposit.transaction_id}`);
      const result = await processSpecificTransaction(deposit.transaction_id);

      if (result.success) {
        processed++;
        console.log(`Successfully processed deposit ${deposit.id}`);
        toast.success(`Xử lý thành công giao dịch #${deposit.transaction_id}`);
      } else {
        failed++;
        console.error(`Failed to process deposit ${deposit.id}:`, result.error);
        toast.error(result.error || "Không thể xử lý giao dịch");
      }
    }

    console.log(`Processing complete: ${processed} succeeded, ${failed} failed`);
    return {
      success: true,
      processed,
      failed
    };
  } catch (error) {
    console.error("Exception in processPendingTransactions:", error);
    toast.error(error instanceof Error ? error.message : "Lỗi không xác định khi xử lý giao dịch");
    return {
      success: false,
      processed: 0,
      failed: 0,
      error: error instanceof Error ? error.message : "Unknown error processing pending transactions"
    };
  }
};

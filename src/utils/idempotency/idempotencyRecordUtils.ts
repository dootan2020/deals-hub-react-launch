
import { supabase } from '@/integrations/supabase/client';

/**
 * Records an idempotent request attempt
 */
export const recordIdempotentRequest = async (
  idempotencyKey: string,
  payload: any,
  requestType: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .insert({
        idempotency_key: idempotencyKey,
        payment_method: 'api',
        status: 'processing',
        amount: 0,
        user_id: payload.user_id || null,
        transaction_id: payload.transaction_id || payload.order_id || null
      });

    if (error) {
      console.error('Error recording idempotent request:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Exception recording idempotent request:', error);
    return false;
  }
};

/**
 * Updates the status of an idempotent request
 */
export const updateIdempotentRequestStatus = async (
  idempotencyKey: string,
  status: 'success' | 'error' | 'skipped',
  responseData?: any,
  errorMessage?: string
): Promise<boolean> => {
  try {
    const updateData: Record<string, any> = {
      status: status
    };

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (error || !data) {
      console.error('Error finding transaction for status update:', error);
      return false;
    }

    const { error: updateError } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('idempotency_key', idempotencyKey);

    if (updateError) {
      console.error('Error updating idempotent request status:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception updating idempotent request status:', error);
    return false;
  }
};

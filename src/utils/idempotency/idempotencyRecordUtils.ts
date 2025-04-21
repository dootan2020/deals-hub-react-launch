
import { supabase } from '@/integrations/supabase/client';
import { IdempotencyResult } from '@/types/fixedTypes';

/**
 * Record the result of a request with this idempotency key
 */
export async function recordIdempotencyResult<T>(
  key: string,
  keyType: string,
  result: T,
  contextData?: any
): Promise<boolean> {
  try {
    // Store the result for this idempotency key
    const { error } = await supabase
      .from('transaction_logs')
      .insert({
        idempotency_key: key,
        status: 'pending',
        request_payload: contextData || {},
        response_payload: null
      });

    if (error) {
      console.error('Error storing idempotency key result:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception in recordIdempotencyResult:', err);
    return false;
  }
}

/**
 * Update the status of a request with this idempotency key
 */
export async function updateIdempotencyStatus<T>(
  key: string,
  status: 'success' | 'error',
  result: T | null,
  errorMessage?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('transaction_logs')
      .update({
        status,
        response_payload: result,
        error_message: errorMessage
      })
      .eq('idempotency_key', key);

    if (error) {
      console.error('Error updating idempotency status:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception in updateIdempotencyStatus:', err);
    return false;
  }
}

/**
 * Delete an idempotency key
 */
export async function deleteIdempotencyKey(
  key: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('transaction_logs')
      .delete()
      .eq('idempotency_key', key);

    if (error) {
      console.error('Error deleting idempotency key:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception in deleteIdempotencyKey:', err);
    return false;
  }
}

// Internal function to avoid circular dependency
async function checkIdempotencyKeyInternal<T>(
  key: string
): Promise<IdempotencyResult<T>> {
  try {
    const { data, error } = await supabase
      .from('transaction_logs')
      .select('*')
      .eq('idempotency_key', key)
      .maybeSingle();

    if (error) {
      console.error('Error checking idempotency key:', error);
      return { result: null, isNew: true };
    }

    if (!data) {
      return { result: null, isNew: true };
    }

    return { 
      result: data.response_payload as T, 
      isNew: false
    };
  } catch (err) {
    console.error('Exception in checkIdempotencyKey:', err);
    return { result: null, isNew: true };
  }
}

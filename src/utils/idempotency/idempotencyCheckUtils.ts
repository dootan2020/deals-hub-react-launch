
import { supabase } from '@/integrations/supabase/client';
import { IdempotencyResult } from '@/types/fixedTypes';

/**
 * Check if a request with this idempotency key already exists and return its result
 */
export async function checkIdempotencyKey<T>(
  key: string,
  keyType: string
): Promise<IdempotencyResult<T>> {
  try {
    // Query for existing idempotency record in transaction_logs
    const { data, error } = await supabase
      .from('transaction_logs')
      .select('*')
      .eq('idempotency_key', key)
      .maybeSingle();

    if (error) {
      console.error('Error checking idempotency key:', error);
      return { result: null, isNew: true };
    }

    // If no record was found, this is a new request
    if (!data) {
      return { result: null, isNew: true };
    }

    // Return the stored result
    return { 
      result: data.response_payload as T, 
      isNew: false
    };
  } catch (err) {
    console.error('Exception in checkIdempotencyKey:', err);
    return { result: null, isNew: true };
  }
}

export async function getIdempotencyRecord(key: string, keyType: string) {
  try {
    const { data, error } = await supabase
      .from('transaction_logs')
      .select('*')
      .eq('idempotency_key', key)
      .maybeSingle();

    if (error) {
      console.error('Error retrieving idempotency record:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception in getIdempotencyRecord:', err);
    return null;
  }
}

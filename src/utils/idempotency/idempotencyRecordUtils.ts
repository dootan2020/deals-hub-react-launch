
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
      .from('idempotency_keys')
      .upsert({
        key,
        key_type: keyType,
        result,
        context_data: contextData || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
 * Delete an idempotency key
 */
export async function deleteIdempotencyKey(
  key: string,
  keyType: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('idempotency_keys')
      .delete()
      .eq('key', key)
      .eq('key_type', keyType);

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

/**
 * Process a request with idempotency checking and result recording
 */
export async function processWithIdempotencyHandling<T>(
  key: string,
  keyType: string,
  processor: () => Promise<T>,
  contextData?: any
): Promise<IdempotencyResult<T>> {
  try {
    // Check if we already have a result for this key
    const checkResult = await checkIdempotencyKeyInternal<T>(key, keyType);
    
    if (!checkResult.isNew) {
      // We already have a result, return it
      return checkResult;
    }
    
    // Process the request
    const result = await processor();
    
    // Record the result
    await recordIdempotencyResult(key, keyType, result, contextData);
    
    // Return the newly generated result
    return { result, isNew: true };
  } catch (error) {
    console.error('Error in processWithIdempotencyHandling:', error);
    return { result: null as T, isNew: true, error: (error as Error).message };
  }
}

// Internal function to avoid circular dependency
async function checkIdempotencyKeyInternal<T>(
  key: string,
  keyType: string
): Promise<IdempotencyResult<T>> {
  try {
    const { data, error } = await supabase
      .from('idempotency_keys')
      .select('*')
      .eq('key', key)
      .eq('key_type', keyType)
      .maybeSingle();

    if (error) {
      console.error('Error checking idempotency key:', error);
      return { result: null as T, isNew: true };
    }

    if (!data) {
      return { result: null as T, isNew: true };
    }

    return { 
      result: data.result as T, 
      isNew: false
    };
  } catch (err) {
    console.error('Exception in checkIdempotencyKey:', err);
    return { result: null as T, isNew: true };
  }
}

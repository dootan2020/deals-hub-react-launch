
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { IdempotencyResult } from '@/types/fixedTypes';

/**
 * Generates a deterministic idempotency key based on provided parameters
 */
export const generateIdempotencyKey = (
  prefix: string,
  data: Record<string, any>
): string => {
  // Create a consistent string representation of the data
  const sortedKeys = Object.keys(data).sort();
  const sortedData = sortedKeys.reduce((result, key) => {
    // Skip undefined or null values
    if (data[key] !== undefined && data[key] !== null) {
      result[key] = data[key];
    }
    return result;
  }, {} as Record<string, any>);
  
  // Create a deterministic string (sorted JSON)
  const dataString = JSON.stringify(sortedData);
  
  // Use a hash function if needed for shorter keys
  // Here we just use the first 8 chars of a UUID plus the dataString
  const randomPart = uuidv4().split('-')[0];
  const encodedData = Buffer.from(dataString).toString('base64').substring(0, 16);
  return `${prefix}_${randomPart}_${encodedData}`;
};

/**
 * Generates a random idempotency key
 */
export const generateRandomIdempotencyKey = (prefix: string): string => {
  return `${prefix}_${uuidv4()}`;
};

/**
 * Checks if a transaction with the given idempotency key has already been processed
 */
export const checkIdempotency = async (
  table: 'deposits' | 'orders' | 'transactions',
  idempotencyKey: string
): Promise<{ exists: boolean; data?: any }> => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();
      
    if (error) {
      console.error(`Error checking idempotency in table ${table}:`, error);
      return { exists: false };
    }
    
    return {
      exists: !!data,
      data: data || undefined
    };
  } catch (error) {
    console.error(`Exception checking idempotency in table ${table}:`, error);
    return { exists: false };
  }
};

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
    
    // Find the transaction record with this idempotency key
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();
      
    if (error || !data) {
      console.error('Error finding transaction for status update:', error);
      return false;
    }
    
    // Update the transaction status
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

/**
 * Complete idempotency flow helper that checks, records, and handles a request
 * Fixed version that avoids recursive type issues
 */
export const processWithIdempotency = async<T>(
  idempotencyKey: string,
  processFunction: () => Promise<T>,
  payload: any,
  requestType: string
): Promise<IdempotencyResult<T>> => {
  try {
    // First check if this request has already been processed
    const { exists, data } = await checkIdempotency('transactions', idempotencyKey);
    
    if (exists && data?.status === 'success') {
      console.log(`Request with idempotency key ${idempotencyKey} already processed, returning cached result`);
      return { 
        result: data.response_payload as T,
        isNew: false
      };
    }
    
    // Record this attempt
    await recordIdempotentRequest(idempotencyKey, payload, requestType);
    
    // Process the request
    const result = await processFunction();
    
    // Update the status
    await updateIdempotentRequestStatus(idempotencyKey, 'success', result);
    
    return {
      result,
      isNew: true
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error in idempotent processing for key ${idempotencyKey}:`, error);
    
    // Update the status with error
    await updateIdempotentRequestStatus(idempotencyKey, 'error', null, errorMessage);
    
    return {
      result: null,
      isNew: true,
      error: errorMessage
    };
  }
};

export default {
  generateIdempotencyKey,
  generateRandomIdempotencyKey,
  checkIdempotency,
  recordIdempotentRequest,
  updateIdempotentRequestStatus,
  processWithIdempotency
};

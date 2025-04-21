
import { checkIdempotency } from './idempotencyCheckUtils';
import { recordIdempotentRequest, updateIdempotentRequestStatus } from './idempotencyRecordUtils';
import { IdempotencyResult } from '@/types/fixedTypes';

/**
 * Complete idempotency flow helper that checks, records, and handles a request
 * Fixed version to avoid recursive type issues
 */
export const processWithIdempotency = async <T>(
  idempotencyKey: string,
  processFunction: () => Promise<T>,
  payload: any,
  requestType: string
): Promise<IdempotencyResult<T>> => {
  try {
    const { exists, data } = await checkIdempotency('transactions', idempotencyKey);

    if (exists && data?.status === 'success') {
      console.log(`Request with idempotency key ${idempotencyKey} already processed, returning cached result`);
      return {
        result: data.response_payload as T,
        isNew: false
      };
    }

    await recordIdempotentRequest(idempotencyKey, payload, requestType);

    const result = await processFunction();

    await updateIdempotentRequestStatus(idempotencyKey, 'success', result);

    return {
      result,
      isNew: true
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error in idempotent processing for key ${idempotencyKey}:`, error);

    await updateIdempotentRequestStatus(idempotencyKey, 'error', null, errorMessage);

    return {
      result: null,
      isNew: true,
      error: errorMessage
    };
  }
};

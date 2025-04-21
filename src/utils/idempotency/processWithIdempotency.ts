
import { checkIdempotencyKey } from './idempotencyCheckUtils';
import { recordIdempotencyResult, updateIdempotencyStatus } from './idempotencyRecordUtils';
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
    const { result, isNew } = await checkIdempotencyKey<T>(idempotencyKey, requestType);

    if (!isNew && result !== null) {
      console.log(`Request with idempotency key ${idempotencyKey} already processed, returning cached result`);
      return {
        result,
        isNew: false
      };
    }

    await recordIdempotencyResult(idempotencyKey, requestType, payload);

    const processResult = await processFunction();

    await updateIdempotencyStatus(idempotencyKey, 'success', processResult);

    return {
      result: processResult,
      isNew: true
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error in idempotent processing for key ${idempotencyKey}:`, error);

    await updateIdempotencyStatus(idempotencyKey, 'error', null, errorMessage);

    return {
      result: null,
      isNew: true,
      error: errorMessage
    };
  }
};


import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a deterministic idempotency key based on provided parameters.
 */
export const generateIdempotencyKey = (
  prefix: string,
  data: Record<string, any>
): string => {
  const sortedKeys = Object.keys(data).sort();
  const sortedData = sortedKeys.reduce((result, key) => {
    if (data[key] !== undefined && data[key] !== null) {
      result[key] = data[key];
    }
    return result;
  }, {} as Record<string, any>);
  const dataString = JSON.stringify(sortedData);
  const randomPart = uuidv4().split('-')[0];
  const encodedData = Buffer.from(dataString).toString('base64').substring(0, 16);
  return `${prefix}_${randomPart}_${encodedData}`;
};

/**
 * Generates a random idempotency key.
 */
export const generateRandomIdempotencyKey = (prefix: string): string => {
  return `${prefix}_${uuidv4()}`;
};

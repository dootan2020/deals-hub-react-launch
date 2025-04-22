
/**
 * Generate an idempotency key based on operation and data
 * This is useful for preventing duplicate operations
 */
export function generateIdempotencyKey(operation: string, data: Record<string, any>): string {
  const prefix = `${operation}_`;
  const dataString = Object.entries(data)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');
  
  return `${prefix}${dataString}`;
}

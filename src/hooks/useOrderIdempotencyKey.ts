
import { generateIdempotencyKey } from '@/utils/idempotencyUtils';

export function useOrderIdempotencyKey(userId: string | undefined, productId: string, quantity: number) {
  return generateIdempotencyKey('order', { 
    user_id: userId || 'anonymous',
    product_id: productId,
    quantity: quantity,
    timestamp: new Date().getTime()
  });
}

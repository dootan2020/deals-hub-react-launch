
import { supabase } from '@/integrations/supabase/client';
import { Order, normalizeUserField } from './orderUtils';
import { prepareQueryParam, safeCastArray, isSafeToSpread } from '@/utils/supabaseTypeUtils';

// Fetch all orders with user, product and order-items details
export async function fetchOrdersWithDetails(): Promise<Order[]> {
  const { data, error: ordersError } = await supabase
    .from('orders')
    .select(`
      *,
      user:user_id(email),
      product:product_id(title, images)
    `)
    .order('created_at', { ascending: false });

  if (ordersError) throw ordersError;

  // Filter out any error objects and ensure we have an array
  const validData = safeCastArray<any>(data).filter(item => !item.error && item);

  const ordersWithDetails = await Promise.all(
    validData.map(async (order: any) => {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', prepareQueryParam(order.id));
        
      // handle nulls for user
      const userValue = normalizeUserField(order.user || null);
      
      // Only spread order if it's safe to do so
      const baseOrder = isSafeToSpread(order) ? order : {};
      
      return {
        ...baseOrder,
        user: userValue,
        order_items: orderItems || [],
      } as Order;
    })
  );

  return ordersWithDetails;
}


import { supabase } from '@/integrations/supabase/client';
import { Order, normalizeUserField } from './orderUtils';

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

  const ordersWithDetails = await Promise.all(
    (data || []).map(async (order: any) => {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);
      // handle nulls for user
      const userValue = normalizeUserField(order.user || null);
      return {
        ...order,
        user: userValue,
        order_items: orderItems || [],
      } as Order;
    })
  );

  return ordersWithDetails;
}


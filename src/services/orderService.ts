
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types';

// Fetch orders for a specific user
export const fetchUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform the data to match our Order interface
    const transformedData: Order[] = (data || []).map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      external_order_id: item.external_order_id,
      status: item.status,
      total_amount: item.total_price, // Use total_price as total_amount for consistency
      total_price: item.total_price,
      created_at: item.created_at,
      updated_at: item.updated_at,
      user: null, // Will be populated later if needed
      order_items: item.order_items || [],
      qty: item.qty,
      product_id: item.product_id,
      keys: item.keys,
      promotion_code: item.promotion_code
    }));
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

// Fetch a specific order by ID
export const fetchOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (error) throw error;
    
    if (!data) return null;
    
    // Transform to match our Order interface
    const transformedData: Order = {
      id: data.id,
      user_id: data.user_id,
      external_order_id: data.external_order_id,
      status: data.status,
      total_amount: data.total_price, // Use total_price as total_amount for consistency
      total_price: data.total_price,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user: null, // Will be populated later if needed
      order_items: data.order_items || [],
      qty: data.qty,
      product_id: data.product_id,
      keys: data.keys,
      promotion_code: data.promotion_code
    };
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    throw error;
  }
};

// Create a new order
export const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
  try {
    // Transform the order data to match the database schema
    const dbOrderData: any = {
      user_id: orderData.user_id,
      external_order_id: orderData.external_order_id,
      status: orderData.status || 'pending', // Ensure status has a default value
      total_price: orderData.total_price || 0, // Ensure total_price has a default value
      qty: orderData.qty,
      product_id: orderData.product_id,
      keys: orderData.keys,
      promotion_code: orderData.promotion_code
    };
    
    const { data, error } = await supabase
      .from('orders')
      .insert(dbOrderData)
      .select()
      .single();

    if (error) throw error;
    
    // Transform to match our Order interface
    const transformedData: Order = {
      id: data.id,
      user_id: data.user_id,
      external_order_id: data.external_order_id,
      status: data.status,
      total_amount: data.total_price, // Use total_price as total_amount for consistency
      total_price: data.total_price,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user: null, // Will be populated later if needed
      order_items: [], // Will be populated later if needed
      qty: data.qty,
      product_id: data.product_id,
      keys: data.keys,
      promotion_code: data.promotion_code
    };
    
    return transformedData;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

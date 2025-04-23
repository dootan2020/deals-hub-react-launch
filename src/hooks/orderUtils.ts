
import { Order, OrderItem } from "@/types";

export const normalizeUserField = (userData: any) => {
  if (!userData) return null;
  if (typeof userData === 'object' && 'email' in userData) {
    return userData.email;
  }
  return userData;
};

// Helper function to transform order data from database to our Order interface
export const transformOrderData = (data: any): Order => {
  return {
    id: data.id,
    user_id: data.user_id,
    external_order_id: data.external_order_id,
    status: data.status,
    total_amount: data.total_price, // Use total_price as total_amount for consistency
    total_price: data.total_price,
    created_at: data.created_at,
    updated_at: data.updated_at,
    user: data.user,
    order_items: data.order_items || [],
    qty: data.qty,
    product_id: data.product_id,
    keys: data.keys,
    promotion_code: data.promotion_code
  };
};


export interface Order {
  id: string;
  user_id: string;
  external_order_id: string | null;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  product_title?: string;
  user: {
    email: string;
    display_name?: string;
  };
  product: {
    title: string;
    images?: string[];
  };
  order_items: {
    id: string;
    quantity: number;
    price: number;
    created_at: string | null;
    product_id: string | null;
    external_product_id: string | null;
    order_id: string | null;
  }[];
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';

export const normalizeUserField = (userField: any): { email: string; display_name?: string } => {
  // If it's a string (probably just an email), return it as the email
  if (typeof userField === 'string') {
    return { email: userField };
  }
  // If it's null/undefined, provide default
  if (!userField) {
    return { email: 'Unknown User' };
  }
  // If it's an object, extract fields
  return {
    email: userField.email || 'Unknown User',
    display_name: userField.display_name
  };
};

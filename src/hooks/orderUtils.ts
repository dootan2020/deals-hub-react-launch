
import { Product } from "@/types";

export interface Order {
  id: string;
  user_id: string;
  external_order_id: string | null;
  status: string;
  total_amount: number;
  total_price?: number; // For backward compatibility
  created_at: string;
  updated_at: string;
  user: any;
  order_items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  price: number;
  quantity: number;
  product?: Product;
  external_product_id?: string;
}

export const normalizeUserField = (userData: any) => {
  if (!userData) return null;
  if (typeof userData === 'object' && 'email' in userData) {
    return userData.email;
  }
  return userData;
};

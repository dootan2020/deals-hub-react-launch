
// Shared types and utilities for Orders

import { Json } from '@/integrations/supabase/types';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  price: number;
  quantity: number;
  created_at: string | null;
  external_product_id: string | null;
}

export interface Order {
  id: string;
  user_id: string;
  total_price: number;
  status: string;
  created_at: string | null;
  updated_at: string;
  product_id?: string;
  qty: number;
  keys?: Json;
  promotion_code?: string;
  external_order_id?: string;
  user?: { 
    email: string;
    display_name?: string;
  } | null;
  product?: {
    title: string;
    images?: string[] | null;
  };
  order_items?: OrderItem[];
}

export function normalizeUserField(user: any): { email: string; display_name?: string } {
  if (
    user &&
    typeof user === 'object' &&
    user !== null &&
    !('error' in user) &&
    typeof user.email === 'string'
  ) {
    return user as { email: string; display_name?: string };
  }
  return { email: 'N/A' };
}

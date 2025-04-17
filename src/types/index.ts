
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  categoryId: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  badges: string[];
  slug: string;
  features?: string[];
  specifications?: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  slug: string;
  count: number;
  parent_id?: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderSummary {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface UserAddress {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal' | 'crypto';
  name: string;
  lastFour?: string;
  expiryDate?: string;
}

export type Language = 'en' | 'es' | 'pt';

export interface OrderDetails {
  id: string;
  items: CartItem[];
  summary: OrderSummary;
  paymentMethod: PaymentMethod;
  shippingAddress: UserAddress;
  date: string;
  status: 'processing' | 'completed' | 'shipped' | 'cancelled';
}

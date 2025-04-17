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
  specifications?: Record<string, string | number | boolean | object>;
  salesCount?: number; // Field for tracking sales count
  createdAt?: string; // Field for tracking when product was added
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

// Define proper route parameter interfaces with index signatures
export interface CategoryPageParams extends Record<string, string | undefined> {
  categorySlug?: string;
  parentCategorySlug?: string;
}

export interface ProductPageParams extends Record<string, string | undefined> {
  productSlug?: string;
  categorySlug?: string;
  parentCategorySlug?: string;
}

export interface SubcategoryPageParams extends Record<string, string | undefined> {
  categorySlug?: string;
  parentCategorySlug?: string;
}

export interface FilterParams {
  priceRange?: string[];
  rating?: string[];
  inStock?: boolean;
  sort?: string;
  page?: number;
  categoryId?: string;
}

// Define a Json type to handle complex database structures
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface SubcategoryItem {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Category[];
}

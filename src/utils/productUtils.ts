
import { Product } from '@/types';

/**
 * Ensures a mock product has all required fields according to the Product interface
 */
export const ensureProductFields = (product: Partial<Product>): Product => {
  return {
    id: product.id || '',
    title: product.title || '',
    description: product.description || '',
    shortDescription: product.shortDescription || product.description?.substring(0, 200) || '',
    price: product.price || 0,
    originalPrice: product.originalPrice,
    images: product.images || [],
    categoryId: product.categoryId || '',
    categories: product.categories,
    rating: product.rating || 0,
    reviewCount: product.reviewCount || 0,
    inStock: product.inStock !== undefined ? product.inStock : true,
    stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity : 0,
    badges: product.badges || [],
    slug: product.slug || '',
    features: product.features || [],
    specifications: product.specifications || {},
    salesCount: product.salesCount || 0,
    createdAt: product.createdAt || new Date().toISOString(),
    kiosk_token: product.kiosk_token || '', // Added default empty string for kiosk_token
    stock: product.stock !== undefined ? product.stock : 0
  };
};

/**
 * Ensures an array of mock products have all required fields
 */
export const ensureProductsFields = (products: Partial<Product>[]): Product[] => {
  return products.map(ensureProductFields);
};

/**
 * Formats a price from cents to a currency string
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price / 100); // Assuming price is stored in cents
};


import { Product } from '@/types';

/**
 * Calculate discount percentage between original price and current price
 */
export const calculateDiscountPercentage = (originalPrice: number, currentPrice: number): number => {
  if (!originalPrice || originalPrice <= 0 || !currentPrice || currentPrice <= 0) {
    return 0;
  }
  
  const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
  return Math.round(discount);
};

/**
 * Generate mock product data for testing
 */
export const generateMockProduct = (overrides: Partial<Product> = {}): Product => {
  return {
    id: `product-${Math.random().toString(36).substring(2, 9)}`,
    title: overrides.title || 'Sample Product',
    slug: overrides.slug || 'sample-product',
    description: overrides.description || 'This is a sample product description',
    shortDescription: overrides.shortDescription || 'Sample product short description',
    price: overrides.price || 99000,
    originalPrice: overrides.originalPrice || 149000,
    images: overrides.images || ['/images/placeholder.jpg'],
    categoryId: overrides.categoryId || 'category-1',
    rating: overrides.rating || 4.5,
    reviewCount: overrides.reviewCount || 12,
    inStock: overrides.inStock !== undefined ? overrides.inStock : true,
    stockQuantity: overrides.stockQuantity || 10,
    badges: overrides.badges || ['new', 'sale'],
    features: overrides.features || ['Feature 1', 'Feature 2'],
    specifications: overrides.specifications || { key1: 'value1', key2: 'value2' },
    salesCount: overrides.salesCount || 25,
    stock: overrides.stock || 10,
    kiosk_token: overrides.kiosk_token || '',
    createdAt: overrides.createdAt || new Date().toISOString(),
    category: overrides.category || null
  };
};

/**
 * Get badge classes based on stock status
 */
export const getStockBadgeClasses = (stockQuantity: number): string => {
  if (stockQuantity > 10) {
    return 'bg-green-100 text-green-800';
  } else if (stockQuantity > 0) {
    return 'bg-yellow-100 text-yellow-800';
  } else {
    return 'bg-red-100 text-red-800';
  }
};

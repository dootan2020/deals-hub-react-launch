
import { Product } from '@/types';

/**
 * Calculates the discount percentage for a product
 */
export function calculateDiscountPercentage(product: Product): number | null {
  if (!product.originalPrice || product.originalPrice <= product.price) {
    return null;
  }
  
  const discount = product.originalPrice - product.price;
  return Math.round((discount / product.originalPrice) * 100);
}

/**
 * Creates a simplified product object with only essential properties
 */
export function createSimplifiedProduct(data: Partial<Product>): Partial<Product> {
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    description: data.description,
    shortDescription: data.shortDescription || data.description?.substring(0, 100),
    price: data.price || 0,
    originalPrice: data.originalPrice,
    images: data.images || [],
    category: data.category,
    categoryId: data.categoryId,
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0,
    inStock: data.inStock !== undefined ? data.inStock : true,
    stockQuantity: data.stockQuantity || 0,
    badges: data.badges || [],
    features: data.features || [],
    specifications: data.specifications || {},
    salesCount: data.salesCount || 0,
    stock: data.stock || 0
  };
}

/**
 * Formats product data for display
 */
export function formatProductData(product: Product): Product {
  return {
    ...product,
    price: typeof product.price === 'number' ? product.price : 0,
    stock: typeof product.stock === 'number' ? product.stock : 0,
    rating: typeof product.rating === 'number' ? product.rating : 0,
    images: Array.isArray(product.images) ? product.images : [],
    badges: Array.isArray(product.badges) ? product.badges : []
  };
}

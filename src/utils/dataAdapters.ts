
import { Category, Product } from '@/types';

/**
 * Converts a category object from the database format to the application format
 */
export function adaptCategory(dbCategory: any): Category {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    slug: dbCategory.slug,
    description: dbCategory.description,
    image: dbCategory.image,
    count: dbCategory.count || 0,
    parentId: dbCategory.parent_id || null,
    createdAt: dbCategory.created_at
  };
}

/**
 * Converts a product object from the database format to the application format
 */
export function adaptProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    title: dbProduct.title,
    slug: dbProduct.slug,
    description: dbProduct.description,
    shortDescription: dbProduct.short_description || dbProduct.shortDescription || '',
    price: Number(dbProduct.price) || 0,
    originalPrice: dbProduct.original_price !== undefined ? Number(dbProduct.original_price) : undefined,
    images: Array.isArray(dbProduct.images) ? dbProduct.images : [],
    categoryId: dbProduct.category_id || dbProduct.categoryId,
    rating: Number(dbProduct.rating) || 0,
    reviewCount: Number(dbProduct.review_count) || 0,
    inStock: dbProduct.in_stock !== undefined ? dbProduct.in_stock : dbProduct.inStock,
    stockQuantity: Number(dbProduct.stock_quantity) || Number(dbProduct.stockQuantity) || 0,
    badges: Array.isArray(dbProduct.badges) ? dbProduct.badges : [],
    features: Array.isArray(dbProduct.features) ? dbProduct.features : [],
    specifications: dbProduct.specifications || {},
    salesCount: Number(dbProduct.sales_count) || Number(dbProduct.salesCount) || 0,
    stock: Number(dbProduct.stock) || 0,
    kiosk_token: dbProduct.kiosk_token || '',
    createdAt: dbProduct.created_at || dbProduct.createdAt || new Date().toISOString(),
    category: null // This would typically be filled in separately if needed
  };
}

/**
 * Adapts an array of categories from database format
 */
export function adaptCategories(dbCategories: any[]): Category[] {
  return Array.isArray(dbCategories) ? dbCategories.map(adaptCategory) : [];
}

/**
 * Adapts an array of products from database format
 */
export function adaptProducts(dbProducts: any[]): Product[] {
  return Array.isArray(dbProducts) ? dbProducts.map(adaptProduct) : [];
}

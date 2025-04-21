
import { Product } from '@/types';

export function prepareProductForPurchase(
  product?: any, 
  productId?: string, 
  kioskToken?: string
): Product | null {
  if (!product && !productId && !kioskToken) {
    return null;
  }

  // If we have a complete product, just ensure required fields are present
  if (product) {
    return {
      id: product.id || productId || '',
      kiosk_token: product.kiosk_token || kioskToken || '',
      title: product.title || 'Unknown Product',
      price: product.price || 0,
      stockQuantity: product.stockQuantity || product.stock || 0,
      description: product.description || product.shortDescription || 'No description available', // Ensure description is always set
      images: product.images || [],
      categoryId: product.categoryId || '',
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      badges: product.badges || [],
      features: product.features || [],
      slug: product.slug || '',
      inStock: product.inStock !== undefined ? product.inStock : true,
      specifications: product.specifications || {},
      createdAt: product.createdAt || product.created_at || new Date().toISOString(),
      shortDescription: product.shortDescription || ''
    };
  }

  // Create a minimal product with the provided IDs
  return {
    id: productId || '',
    kiosk_token: kioskToken || '',
    title: 'Quick Purchase',
    price: 0,
    stockQuantity: 1,
    description: 'Quick purchase product', // This field is now always set
    inStock: true
  };
}

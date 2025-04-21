import { Product } from '@/types';
import { MinimalProduct } from '@/types/fixedTypes';

/**
 * Prepares a product for purchase by ensuring all required fields are set
 */
export function prepareProductForPurchase(
  product?: any, 
  productId?: string, 
  kioskToken?: string
): Product | null {
  if (!product && !productId && !kioskToken) {
    console.error('No product information provided to BuyNowButton');
    return null;
  }

  // If we have a complete product already, return it
  if (product && product.id && product.title) {
    // Ensure description is set - this is required by the Product type
    const preparedProduct = {
      ...product,
      description: product.description || product.short_description || '',
      stock: product.stock || 0,
      // Ensure all required properties are set
      category_id: product.category_id || product.categoryId || '',
      review_count: product.review_count || product.reviewCount || 0,
      in_stock: product.in_stock !== undefined ? product.in_stock : product.inStock !== undefined ? product.inStock : true,
      short_description: product.short_description || product.shortDescription || '',
      
      // Computed properties
      get originalPrice() { return this.original_price; },
      get shortDescription() { return this.short_description || this.description.substring(0, 100); },
      get categoryId() { return this.category_id; },
      get inStock() { return this.in_stock; },
      get stockQuantity() { return this.stock_quantity || this.stock || 0; },
      get reviewCount() { return this.review_count || 0; },
      get salesCount() { return 0; }
    };
    return preparedProduct as Product;
  }

  // Otherwise construct a minimal product
  const minimalProduct: Product = {
    id: product?.id || productId || 'unknown',
    title: product?.title || 'Product',
    price: product?.price || 0,
    description: product?.description || product?.short_description || '',
    stock: product?.stock || 0,
    kiosk_token: product?.kiosk_token || kioskToken || '',
    // Add required fields with default values
    images: product?.images || [],
    category_id: product?.category_id || product?.categoryId || 'default',
    rating: product?.rating || 0,
    review_count: product?.review_count || product?.reviewCount || 0,
    in_stock: product?.in_stock !== undefined ? product?.in_stock : product?.inStock !== undefined ? product?.inStock : true,
    stock_quantity: product?.stock_quantity || product?.stockQuantity || 0,
    badges: product?.badges || [],
    slug: product?.slug || 'product',
    features: product?.features || [],
    specifications: product?.specifications || {},
    createdAt: product?.createdAt || new Date().toISOString(),
    short_description: product?.short_description || product?.shortDescription || '',
    
    // Computed properties
    get originalPrice() { return this.original_price; },
    get shortDescription() { return this.short_description || this.description.substring(0, 100); },
    get categoryId() { return this.category_id; },
    get inStock() { return this.in_stock; },
    get stockQuantity() { return this.stock_quantity || this.stock || 0; },
    get reviewCount() { return this.review_count || 0; },
    get salesCount() { return 0; }
  };

  return minimalProduct;
}

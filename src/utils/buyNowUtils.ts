import { Product } from '@/types';

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
      stock: product.stock || 0
    };
    return preparedProduct as Product;
  }

  // Otherwise construct a minimal product
  const minimalProduct: Product = {
    id: product?.id || productId || 'unknown',
    title: product?.title || 'Sản phẩm',
    price: product?.price || 0,
    description: product?.description || product?.short_description || '',
    stock: product?.stock || 0,
    kiosk_token: product?.kiosk_token || kioskToken || ''
  };

  return minimalProduct;
}


import { Product } from '@/types';
import { ensureProductFields } from '@/utils/productUtils';

/**
 * Prepares a product for the purchase dialog by ensuring all required fields are present
 */
export const prepareProductForPurchase = (
  product: Partial<Product> | undefined,
  fallbackId?: string,
  fallbackKioskToken?: string
): Product => {
  if (product) {
    // Ensure required fields are satisfied as per 'Product' type everywhere
    const productWithRequiredFields = {
      ...product,
      id: product.id || "",
      title: product.title || "",
      price: product.price || 0,
      stockQuantity: product.stockQuantity || 0,
      description: product.description || "", // Always ensure description is a string
      shortDescription: product.shortDescription || product.description?.substring(0, 200) || "",
      images: product.images || [],
      categoryId: product.categoryId || "",
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      inStock: product.inStock !== undefined ? product.inStock : true,
      badges: product.badges || [],
      features: product.features || [],
      specifications: product.specifications || {},
      createdAt: product.createdAt || new Date().toISOString(),
      kiosk_token: product.kiosk_token || ""
    };

    // Use ensureProductFields to guarantee the product matches the required Product type
    return ensureProductFields(productWithRequiredFields);
  } else {
    // Create minimal product with required fields
    return ensureProductFields({
      id: fallbackId || '',
      kiosk_token: fallbackKioskToken || '',
      title: 'Product',
      price: 0,
      stockQuantity: 10,
      description: '', // Always set to string
      images: [],
      categoryId: '',
      rating: 0,
      reviewCount: 0,
      badges: [],
      features: [],
      slug: '',
      inStock: true,
      specifications: {},
      createdAt: new Date().toISOString(),
      stock: 10,
      shortDescription: '',
    });
  }
};

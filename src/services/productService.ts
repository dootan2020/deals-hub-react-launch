
// Re-export product service from the new location for backward compatibility
// Comment out functions that don't exist anymore
import { 
  fetchProductBySlug,
  searchProducts as fetchProducts,
  fetchProductsWithFilters
} from './product/productService';

export {
  fetchProducts,
  fetchProductsWithFilters,
  fetchProductBySlug,
  // Removed functions that don't exist anymore
  // createProduct,
  // updateProduct,
  // updateCategoryCount,
  // incrementProductSales,
  // deleteProduct
};

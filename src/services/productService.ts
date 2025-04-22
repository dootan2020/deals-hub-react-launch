
// Re-export product service from the new location for backward compatibility
import { 
  fetchProducts, 
  fetchProductsWithFilters, 
  fetchProductById,
  fetchProductBySlug,
  createProduct,
  updateProduct,
  updateCategoryCount,
  incrementProductSales,
  deleteProduct
} from './product/productService';

export {
  fetchProducts,
  fetchProductsWithFilters,
  fetchProductById,
  fetchProductBySlug,
  createProduct,
  updateProduct,
  updateCategoryCount,
  incrementProductSales,
  deleteProduct
};


// Mock product service
import { Product } from '@/types';
import mockProducts from '@/data/mockData';

export interface ProductFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  sort?: 'newest' | 'price-low' | 'price-high' | 'popular' | 'name-asc' | 'recommended';
  page?: number;
  perPage?: number;
  priceRange?: [number, number] | { min: number; max: number };
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export const fetchProductsWithFilters = async (filters: ProductFilters): Promise<ProductResponse> => {
  // Log the filters for debugging
  console.log("Fetch products with filters requested:", filters);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredProducts = [...mockProducts];
  
  // Apply filters
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredProducts = filteredProducts.filter(product => 
      product.title.toLowerCase().includes(searchLower) || 
      product.description.toLowerCase().includes(searchLower)
    );
  }
  
  if (filters.category) {
    filteredProducts = filteredProducts.filter(product => 
      product.categoryId === filters.category
    );
  }
  
  // Apply sorting
  if (filters.sort) {
    switch (filters.sort) {
      case 'price-low':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filteredProducts.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
      case 'name-asc':
        filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'recommended':
        filteredProducts.sort((a, b) => {
          // Use the recommended field if available, default to false if not present
          const aRec = a.recommended === true ? 1 : 0;
          const bRec = b.recommended === true ? 1 : 0;
          return bRec - aRec;
        });
        break;
      case 'newest':
      default:
        filteredProducts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }
  
  // Apply price range filter with proper type checking
  if (filters.priceRange) {
    let min: number, max: number;
    
    if (Array.isArray(filters.priceRange)) {
      [min, max] = filters.priceRange;
    } else {
      min = filters.priceRange.min;
      max = filters.priceRange.max;
    }
    
    filteredProducts = filteredProducts.filter(product => 
      product.price >= min && product.price <= max
    );
  } else if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    // Handle minPrice/maxPrice as separate parameters for backward compatibility
    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product => product.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product => product.price <= filters.maxPrice!);
    }
  }
  
  // Apply stock filter
  if (filters.inStock !== undefined) {
    filteredProducts = filteredProducts.filter(product => 
      product.inStock === filters.inStock
    );
  }
  
  // Calculate pagination
  const page = filters.page || 1;
  const perPage = filters.perPage || 10;
  const startIndex = (page - 1) * perPage;
  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / perPage);
  
  // Slice the results for the current page
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + perPage);
  
  return {
    products: paginatedProducts,
    total,
    page,
    totalPages
  };
};

export const fetchProductDetails = async (slug: string): Promise<Product | null> => {
  console.log("Fetch product details requested for:", slug);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const product = mockProducts.find(p => p.slug === slug);
  return product || null;
};

export const fetchRelatedProducts = async (productId: string): Promise<Product[]> => {
  console.log("Fetch related products requested for:", productId);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Find the product
  const product = mockProducts.find(p => p.id === productId);
  if (!product) return [];
  
  // Get products in the same category, excluding the current product
  const relatedProducts = mockProducts
    .filter(p => p.categoryId === product.categoryId && p.id !== productId)
    .slice(0, 4);
    
  return relatedProducts;
};

export const fetchProductBySlug = async (slug: string): Promise<Product> => {
  console.log("Fetch product by slug requested for:", slug);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const product = mockProducts.find(p => p.slug === slug);
  
  if (product) {
    return product;
  }
  
  // Return a mock product if not found
  return {
    id: "mock-id",
    title: "Mock Product",
    description: "This is a mock product description",
    shortDescription: "Mock product short description",
    price: 100000,
    originalPrice: 150000,
    images: [],
    stockQuantity: 10,
    inStock: true,
    kiosk_token: "mock-token",
    stock: 10,
    categoryId: "mock-category",
    rating: 4.5,
    reviewCount: 10,
    badges: [],
    slug: "mock-product",
    features: [],
    specifications: {},
    salesCount: 0,
    createdAt: new Date().toISOString()
  };
};

// Don't use export type with ProductResponse as we're defining the interface in this file
// Removing this line resolves the TS2484 conflict error

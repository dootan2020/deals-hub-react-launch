
// Mock product service
import { Product, SortOption } from '@/types';
import { mockProducts } from '@/data/mockData';

export interface ProductFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  sort?: SortOption;
  page?: number;
  perPage?: number;
  priceRange?: { min: number; max: number };
  minPrice?: number; // Add this for backward compatibility
  maxPrice?: number; // Add this for backward compatibility
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
      product.category_id === filters.category
    );
  }
  
  // Apply sorting
  if (filters.sort) {
    switch (filters.sort) {
      case 'price-asc':
      case 'price-low':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
      case 'price-high':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filteredProducts.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
        break;
      case 'newest':
      default:
        filteredProducts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }
  
  // Apply price range filter - handle both priceRange object and minPrice/maxPrice
  if (filters.priceRange) {
    filteredProducts = filteredProducts.filter(product => 
      product.price >= filters.priceRange!.min && 
      product.price <= filters.priceRange!.max
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
      product.in_stock === filters.inStock
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
    .filter(p => p.category_id === product.category_id && p.id !== productId)
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
    short_description: "Mock product short description",
    price: 100000,
    original_price: 150000,
    images: [],
    category_id: "mock-category",
    rating: 4.5,
    review_count: 10,
    in_stock: true,
    stock_quantity: 10,
    badges: [],
    slug: "mock-product",
    features: [],
    specifications: {},
    stock: 10,
    kiosk_token: "mock-token",
    createdAt: new Date().toISOString(),
    
    // Accessor properties for compatibility
    get originalPrice() { return this.original_price; },
    get shortDescription() { return this.short_description || this.description.substring(0, 100); },
    get categoryId() { return this.category_id; },
    get inStock() { return this.in_stock; },
    get stockQuantity() { return this.stock_quantity || this.stock || 0; },
    get reviewCount() { return this.review_count || 0; },
    get salesCount() { return 0; },
    get category() { return undefined; }
  };
};

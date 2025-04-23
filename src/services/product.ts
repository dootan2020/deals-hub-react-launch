
import { Product, SortOption } from '@/types';

// Sample/mock product data
const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Gmail Premium Account',
    slug: 'gmail-premium-account',
    description: 'Premium Gmail account with enhanced storage and features',
    price: 19.99,
    images: ['/placeholder.svg'],
    category: 'Email Accounts',
    categoryId: '1',
    stock: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Facebook Business Account',
    slug: 'facebook-business-account',
    description: 'Verified Facebook business account ready for advertising',
    price: 29.99,
    images: ['/placeholder.svg'],
    category: 'Social Media Accounts',
    categoryId: '2',
    stock: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Windows 11 Pro License Key',
    slug: 'windows-11-pro-license-key',
    description: 'Genuine Windows 11 Pro license key for 1 PC',
    price: 149.99,
    images: ['/placeholder.svg'],
    category: 'Software Keys',
    categoryId: '3',
    stock: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Interface for filter parameters
export interface FilterParams {
  sort?: SortOption;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// Sort products based on the sort option
const sortProducts = (products: Product[], sort?: SortOption): Product[] => {
  if (!sort) return products;
  
  return [...products].sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'popular':
      default:
        return 0;
    }
  });
};

// Fetch products with filters
export const fetchProductsWithFilters = async (filters: FilterParams = {}) => {
  try {
    // In a real app, this would make an API call
    console.log("Fetching products with filters:", filters);
    
    // Apply filters to mock data
    let filteredProducts = [...mockProducts];
    
    // Apply sort
    filteredProducts = sortProducts(filteredProducts, filters.sort);
    
    // Return with pagination data structure for compatibility
    return {
      products: filteredProducts,
      total: filteredProducts.length,
      currentPage: filters.page || 1,
      totalPages: 1
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      products: [],
      total: 0,
      currentPage: 1,
      totalPages: 0
    };
  }
};

// Fetch a single product by slug
export const fetchProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    console.log("Fetching product by slug:", slug);
    const product = mockProducts.find(p => p.slug === slug);
    return product || null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};

// Basic product search
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    if (!query) return [];
    
    const lowerQuery = query.toLowerCase();
    return mockProducts.filter(product => 
      product.title.toLowerCase().includes(lowerQuery) || 
      product.description.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
};

// Re-export a direct fetchProducts function for backward compatibility
export const fetchProducts = fetchProductsWithFilters;

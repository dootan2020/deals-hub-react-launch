
// Mock product service - placeholder after deletion
export const fetchProductsWithFilters = async (filters: any) => {
  console.log("Fetch products with filters requested:", filters);
  return {
    products: [],
    total: 0,
    page: 1,
    totalPages: 0
  };
};

export const fetchProductDetails = async (slug: string) => {
  console.log("Fetch product details requested for:", slug);
  return null;
};

export const fetchRelatedProducts = async (productId: string) => {
  console.log("Fetch related products requested for:", productId);
  return [];
};

export const fetchProductBySlug = async (slug: string) => {
  console.log("Fetch product by slug requested for:", slug);
  return {
    id: "mock-id",
    title: "Mock Product",
    description: "This is a mock product description",
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
    createdAt: new Date().toISOString()
  };
};

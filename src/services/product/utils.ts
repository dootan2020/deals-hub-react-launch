
interface DatabaseProduct {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  price: number;
  original_price?: number;
  images?: string[];
  category_id: string;
  categories?: any;
  rating?: number;
  review_count?: number;
  in_stock?: boolean;
  stock_quantity?: number;
  badges?: string[];
  slug: string;
  features?: string[];
  specifications?: Record<string, any>;
  sales_count?: number;
  stock: number;
  kiosk_token?: string;
  created_at: string;
}

export function mapProductFromDatabase(item: DatabaseProduct) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    shortDescription: item.short_description || item.description.substring(0, 200),
    price: Number(item.price),
    originalPrice: item.original_price ? Number(item.original_price) : undefined,
    images: item.images || [],
    categoryId: item.category_id,
    categories: item.categories,
    rating: Number(item.rating) || 0,
    reviewCount: item.review_count || 0,
    inStock: item.in_stock === true,
    stockQuantity: item.stock_quantity || 0,
    badges: item.badges || [],
    slug: item.slug,
    features: item.features || [],
    specifications: item.specifications as Record<string, string | number | boolean | object> || {},
    salesCount: item.sales_count || 0,
    sales_count: item.sales_count || 0,
    stock: item.stock || 0,
    kiosk_token: item.kiosk_token || '',
    createdAt: item.created_at
  };
}

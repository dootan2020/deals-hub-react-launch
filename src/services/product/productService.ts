
import { supabase } from '@/integrations/supabase/client';
import { FilterParams, Product, SortOption } from '@/types';

// Fetch products with filters
export const fetchProductsWithFilters = async (filters: FilterParams = {}): Promise<Product[]> => {
  try {
    let query = supabase
      .from('products')
      .select('*, category:category_id(*)');

    // Apply filters
    if (filters.category) {
      const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', filters.category)
        .single();

      if (categories) {
        query = query.eq('category_id', categories.id);
      }
    }

    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters.inStock !== undefined) {
      query = query.eq('in_stock', filters.inStock);
    }

    // Apply sorting
    const sort = filters.sortBy || filters.sort || 'newest';
    switch (sort) {
      case 'price-low':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('price', { ascending: false });
        break;
      case 'popular':
        query = query.order('sales_count', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    if (filters.page && filters.perPage) {
      const from = (filters.page - 1) * filters.perPage;
      const to = from + filters.perPage - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Transform data to match our Product interface
    const products: Product[] = (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      shortDescription: item.short_description || '',
      price: Number(item.price),
      originalPrice: item.original_price ? Number(item.original_price) : undefined,
      images: item.images || [],
      categoryId: item.category_id,
      rating: Number(item.rating || 0),
      reviewCount: Number(item.review_count || 0),
      inStock: Boolean(item.in_stock),
      stockQuantity: Number(item.stock_quantity || 0),
      badges: item.badges || [],
      features: item.features || [],
      specifications: item.specifications || {},
      salesCount: Number(item.sales_count || 0),
      stock: Number(item.stock || 0),
      kiosk_token: item.kiosk_token || '',
      createdAt: item.created_at,
      category: item.category ? {
        id: item.category.id,
        name: item.category.name,
        slug: item.category.slug,
        description: item.category.description,
        image: item.category.image,
        count: item.category.count || 0,
        parentId: item.category.parent_id,
        createdAt: item.category.created_at,
        category: null
      } : null
    }));

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Fetch a single product by slug
export const fetchProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:category_id(*)')
      .eq('slug', slug)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    // Transform to match our Product interface
    const product: Product = {
      id: data.id,
      title: data.title,
      slug: data.slug,
      description: data.description,
      shortDescription: data.short_description || '',
      price: Number(data.price),
      originalPrice: data.original_price ? Number(data.original_price) : undefined,
      images: data.images || [],
      categoryId: data.category_id,
      rating: Number(data.rating || 0),
      reviewCount: Number(data.review_count || 0),
      inStock: Boolean(data.in_stock),
      stockQuantity: Number(data.stock_quantity || 0),
      badges: data.badges || [],
      features: data.features || [],
      specifications: data.specifications || {},
      salesCount: Number(data.sales_count || 0),
      stock: Number(data.stock || 0),
      kiosk_token: data.kiosk_token || '',
      createdAt: data.created_at,
      category: data.category ? {
        id: data.category.id,
        name: data.category.name,
        slug: data.category.slug,
        description: data.category.description,
        image: data.category.image,
        count: data.category.count || 0,
        parentId: data.category.parent_id,
        createdAt: data.category.created_at,
        category: null
      } : null
    };

    return product;
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    throw error;
  }
};

// Simple product search function
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:category_id(*)')
      .ilike('title', `%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Transform data to match our Product interface
    const products: Product[] = (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      shortDescription: item.short_description || '',
      price: Number(item.price),
      originalPrice: item.original_price ? Number(item.original_price) : undefined,
      images: item.images || [],
      categoryId: item.category_id,
      rating: Number(item.rating || 0),
      reviewCount: Number(item.review_count || 0),
      inStock: Boolean(item.in_stock),
      stockQuantity: Number(item.stock_quantity || 0),
      badges: item.badges || [],
      features: item.features || [],
      specifications: item.specifications || {},
      salesCount: Number(item.sales_count || 0),
      stock: Number(item.stock || 0),
      kiosk_token: item.kiosk_token || '',
      createdAt: item.created_at,
      category: item.category ? {
        id: item.category.id,
        name: item.category.name,
        slug: item.category.slug,
        description: item.category.description,
        image: item.category.image,
        count: item.category.count || 0,
        parentId: item.category.parent_id,
        createdAt: item.category.created_at,
        category: null
      } : null
    }));

    return products;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

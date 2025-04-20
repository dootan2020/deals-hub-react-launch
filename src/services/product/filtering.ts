
import { supabase } from "@/integrations/supabase/client";
import { FilterParams, Product } from '@/types';
import { mapProductFromDatabase } from './utils';
import { applyFilters, sortProducts } from '@/utils/productFilters';
import { ProductResponse } from './productService';

export async function fetchProductsWithFilters(filters?: FilterParams): Promise<ProductResponse> {
  try {
    let query = supabase
      .from('products')
      .select('*, categories:category_id(*)', { count: 'exact' });
    
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    // Handle subcategory filtering
    if (filters?.subcategory) {
      query = query.eq('category_id', filters.subcategory);
    }
    
    if (filters?.inStock === true) {
      query = query.gt('stock', 0);
    }

    if (filters?.search && filters.search.length >= 3) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    // Use perPage from filters or default to 24 (increased from 12)
    const pageSize = filters?.perPage || 24;
    
    if (filters?.page !== undefined) {
      const start = (filters.page - 1) * pageSize;
      const end = start + pageSize - 1;
      query = query.range(start, end);
    }
    
    if (filters?.sort) {
      switch (filters.sort) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'name-asc':
          query = query.order('title', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }
    } else {
      query = query.order('created_at', { ascending: false });
    }
      
    const { data, error, count } = await query;
      
    if (error) throw error;
    
    const products = data?.map(mapProductFromDatabase) || [];
    
    // Apply additional filters that can't be done at the database level
    let filteredProducts = applyFilters(products, {
      ...filters,
      categoryId: undefined,
      subcategory: undefined,
      search: undefined,
      inStock: undefined
    });
    
    // Handle special sorting cases
    if (filters?.sort === 'popular') {
      filteredProducts = sortProducts(filteredProducts, 'popular');
    }
    
    // Handle price range filtering
    if (filters?.priceRange) {
      let min: number, max: number;
      
      if (Array.isArray(filters.priceRange)) {
        [min, max] = filters.priceRange;
      } else {
        // Fix the type error by type assertion
        const priceRangeObj = filters.priceRange as { min: number; max: number };
        min = priceRangeObj.min;
        max = priceRangeObj.max;
      }
      
      filteredProducts = filteredProducts.filter(p => p.price >= min && p.price <= max);
    }
    
    // Return properly structured ProductResponse object
    return {
      products: filteredProducts,
      total: count || filteredProducts.length,
      page: filters?.page || 1,
      totalPages: Math.ceil((count || filteredProducts.length) / (filters?.perPage || pageSize))
    };
  } catch (error) {
    console.error("Error fetching products with filters:", error);
    throw error;
  }
}

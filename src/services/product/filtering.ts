
import { supabase } from "@/integrations/supabase/client";
import { FilterParams, Product } from '@/types';
import { mapProductFromDatabase } from './utils';
import { applyFilters, sortProducts } from '@/utils/productFilters';

export async function fetchProductsWithFilters(filters?: FilterParams) {
  try {
    let query = supabase
      .from('products')
      .select('*, categories:category_id(*)');
    
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    
    if (filters?.inStock === true) {
      query = query.gt('stock', 0);
    }

    if (filters?.search && filters.search.length >= 3) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    if (filters?.page !== undefined) {
      const pageSize = 12;
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
      
    const { data, error } = await query;
      
    if (error) throw error;
    
    const products = data?.map(mapProductFromDatabase) || [];
    
    const filteredProducts = applyFilters(products, {
      ...filters,
      categoryId: undefined,
      search: undefined,
      inStock: undefined
    });
    
    if (filters?.sort === 'popular') {
      return sortProducts(filteredProducts, 'popular');
    }
    
    if (filters?.priceRange) {
      const [min, max] = filters.priceRange;
      return filteredProducts.filter(p => p.price >= min && p.price <= max);
    }
    
    return filteredProducts;
  } catch (error) {
    console.error("Error fetching products with filters:", error);
    throw error;
  }
}

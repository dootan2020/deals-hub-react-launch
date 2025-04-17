
import { supabase } from "@/integrations/supabase/client";
import { Product, FilterParams } from '@/types';
import { applyFilters, sortProducts } from '@/utils/productFilters';

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories:category_id(*)')
    .order('title', { ascending: true });
    
  if (error) throw error;
  return data;
}

export async function fetchProductsWithFilters(filters?: FilterParams) {
  try {
    let query = supabase
      .from('products')
      .select('*, categories:category_id(*)');
    
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    
    const { data, error } = await query.order('title', { ascending: true });
      
    if (error) throw error;
    
    const products: Product[] = data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: Number(item.price),
      originalPrice: item.original_price ? Number(item.original_price) : undefined,
      images: item.images || [],
      categoryId: item.category_id,
      rating: Number(item.rating) || 0,
      reviewCount: item.review_count || 0,
      inStock: item.in_stock === true,
      badges: item.badges || [],
      slug: item.slug,
      features: item.features || [],
      specifications: item.specifications as Record<string, string | number | boolean | object> || {},
      salesCount: 0,
      createdAt: item.created_at
    }));
    
    if (!filters) {
      return products;
    }
    
    const filteredProducts = applyFilters(products, {
      ...filters,
      categoryId: undefined
    });
    
    const sortedProducts = sortProducts(filteredProducts, filters.sort);
    
    return sortedProducts;
  } catch (error) {
    console.error("Error fetching products with filters:", error);
    throw error;
  }
}

export async function createProduct(productData: any) {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();
    
    if (error) throw error;
    
    if (productData.category_id) {
      await updateCategoryCount(productData.category_id);
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateProduct({ id, ...product }: { id: string; [key: string]: any }) {
  try {
    const { data: oldProduct, error: fetchError } = await supabase
      .from('products')
      .select('category_id')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    
    const oldCategoryId = oldProduct?.category_id;
    
    const { salesCount, ...dbProduct } = product;
    
    const { data, error } = await supabase
      .from('products')
      .update(dbProduct)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (oldCategoryId !== product.category_id) {
      if (oldCategoryId) {
        await updateCategoryCount(oldCategoryId);
      }
      if (product.category_id) {
        await updateCategoryCount(product.category_id);
      }
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateCategoryCount(categoryId: string) {
  try {
    const { count: directCount, error: directCountError } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('category_id', categoryId);
    
    if (directCountError) throw directCountError;
    
    const { data: subcategories, error: subError } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', categoryId);
    
    if (subError) throw subError;
    
    let totalSubcategoryCount = 0;
    if (subcategories && subcategories.length > 0) {
      const subcategoryIds = subcategories.map(sc => sc.id);
      
      const { count: subCount, error: subCountError } = await supabase
        .from('products')
        .select('id', { count: 'exact' })
        .in('category_id', subcategoryIds);
        
      if (subCountError) throw subCountError;
      totalSubcategoryCount = subCount || 0;
    }
    
    const totalCount = (directCount || 0) + totalSubcategoryCount;
    
    const { error: updateError } = await supabase
      .from('categories')
      .update({ count: totalCount })
      .eq('id', categoryId);
    
    if (updateError) throw updateError;
    
    return totalCount;
  } catch (error) {
    console.error('Error updating category count:', error);
    throw error;
  }
}

export async function incrementProductSales(productId: string, quantity: number = 1) {
  try {
    console.log(`Product ${productId} sales incremented by ${quantity}`);
    return quantity;
  } catch (error) {
    console.error('Error incrementing product sales:', error);
    throw error;
  }
}


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
    
    if (filters?.inStock !== undefined) {
      query = query.eq('in_stock', filters.inStock);
    }
    
    const { data, error } = await query.order('title', { ascending: true });
      
    if (error) throw error;
    
    console.log('Raw products data from API:', data);
    
    const products: Product[] = data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      shortDescription: item.short_description || item.description.substring(0, 200),
      price: Number(item.price),
      originalPrice: item.original_price ? Number(item.original_price) : undefined,
      images: item.images || [],
      categoryId: item.category_id,
      rating: Number(item.rating) || 0,
      reviewCount: item.review_count || 0,
      inStock: item.in_stock === true,
      stockQuantity: item.stock_quantity || 0,
      badges: item.badges || [],
      slug: item.slug,
      features: item.features || [],
      specifications: item.specifications as Record<string, string | number | boolean | object> || {},
      salesCount: 0,
      stock: item.stock || 0,
      kiosk_token: item.kiosk_token || '',
      createdAt: item.created_at
    }));
    
    console.log('Mapped products with kiosk_token:', products.map(p => ({
      title: p.title,
      kiosk_token: p.kiosk_token ? 'present' : 'missing'
    })));
    
    if (!filters) {
      return products;
    }
    
    const filteredProducts = applyFilters(products, {
      ...filters,
      categoryId: undefined
    });
    
    const sortedProducts = sortProducts(filteredProducts, filters.sort);
    
    if (filters.page !== undefined) {
      const pageSize = 12;
      const startIndex = (filters.page - 1) * pageSize;
      return sortedProducts.slice(startIndex, startIndex + pageSize);
    }
    
    return sortedProducts;
  } catch (error) {
    console.error("Error fetching products with filters:", error);
    throw error;
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories:category_id(*)')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      shortDescription: data.short_description || data.description.substring(0, 200),
      price: Number(data.price),
      originalPrice: data.original_price ? Number(data.original_price) : undefined,
      images: data.images || [],
      categoryId: data.category_id,
      rating: Number(data.rating) || 0,
      reviewCount: data.review_count || 0,
      inStock: data.in_stock === true,
      stockQuantity: data.stock_quantity || 0,
      badges: data.badges || [],
      slug: data.slug,
      features: data.features || [],
      specifications: data.specifications as Record<string, string | number | boolean | object> || {},
      salesCount: 0,
      stock: data.stock || 0,
      kiosk_token: data.kiosk_token || '', // Added kiosk_token
      createdAt: data.created_at
    };
  } catch (error) {
    console.error("Error fetching product by id:", error);
    throw error;
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories:category_id(*)')
      .eq('slug', slug)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      shortDescription: data.short_description || data.description.substring(0, 200),
      price: Number(data.price),
      originalPrice: data.original_price ? Number(data.original_price) : undefined,
      images: data.images || [],
      categoryId: data.category_id,
      rating: Number(data.rating) || 0,
      reviewCount: data.review_count || 0,
      inStock: data.in_stock === true,
      stockQuantity: data.stock_quantity || 0,
      badges: data.badges || [],
      slug: data.slug,
      features: data.features || [],
      specifications: data.specifications as Record<string, string | number | boolean | object> || {},
      salesCount: 0,
      stock: data.stock || 0,
      kiosk_token: data.kiosk_token || '', // Added kiosk_token
      createdAt: data.created_at
    };
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    throw error;
  }
}

export async function createProduct(productData: any) {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        stock: productData.stock || 0,
      })
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
      .update({
        ...dbProduct,
        stock: dbProduct.stock || 0,
      })
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

export async function deleteProduct(id: string) {
  try {
    // First delete all sync logs for this product
    const { error: syncLogsError } = await supabase
      .from('sync_logs')
      .delete()
      .eq('product_id', id);

    if (syncLogsError) throw syncLogsError;

    // Then delete the product
    const { error: productError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (productError) throw productError;

    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

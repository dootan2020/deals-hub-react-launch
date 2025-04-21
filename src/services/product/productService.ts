
import { supabase } from "@/integrations/supabase/client";
import { Product, FilterParams } from '@/types';
import { applyFilters, sortProducts } from '@/utils/productFilters';

// Helper function to convert database object to Product type
function mapDbProductToProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    title: dbProduct.title,
    description: dbProduct.description,
    price: Number(dbProduct.price),
    images: dbProduct.images || [],
    category_id: dbProduct.category_id,
    rating: Number(dbProduct.rating) || 0,
    review_count: dbProduct.review_count || 0,
    in_stock: dbProduct.in_stock === true,
    stock_quantity: dbProduct.stock_quantity || 0,
    badges: dbProduct.badges || [],
    slug: dbProduct.slug,
    features: dbProduct.features || [],
    specifications: dbProduct.specifications as Record<string, string | number | boolean | object> || {},
    stock: dbProduct.stock || 0,
    kiosk_token: dbProduct.kiosk_token || '',
    original_price: dbProduct.original_price ? Number(dbProduct.original_price) : undefined,
    short_description: dbProduct.short_description || dbProduct.description?.substring(0, 100),
    createdAt: dbProduct.created_at,
    
    // Include category if it was joined in the query
    category: dbProduct.categories ? {
      id: dbProduct.categories.id,
      name: dbProduct.categories.name,
      description: dbProduct.categories.description,
      image: dbProduct.categories.image,
      slug: dbProduct.categories.slug,
      count: dbProduct.categories.count,
      parent_id: dbProduct.categories.parent_id
    } : undefined,
    
    // Computed properties for compatibility
    get originalPrice() { return this.original_price; },
    get shortDescription() { return this.short_description || this.description.substring(0, 100); },
    get categoryId() { return this.category_id; },
    get inStock() { return this.in_stock; },
    get stockQuantity() { return this.stock_quantity || this.stock || 0; },
    get reviewCount() { return this.review_count; },
    get salesCount() { return 0; }
  };
}

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories:category_id(*)')
    .order('title', { ascending: true });
    
  if (error) throw error;
  
  // Map DB results to Product type
  return data.map(mapDbProductToProduct);
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
    
    const { data, error } = await query.order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Map DB results to Product type
    const products = data.map(mapDbProductToProduct);
    
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
      return {
        products: sortedProducts.slice(startIndex, startIndex + pageSize),
        totalPages: Math.ceil(sortedProducts.length / pageSize)
      };
    }
    
    return {
      products: sortedProducts,
      totalPages: 1
    };
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
    
    return mapDbProductToProduct(data);
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
    
    return mapDbProductToProduct(data);
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

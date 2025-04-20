
import { supabase } from "@/integrations/supabase/client";
import { mapProductFromDatabase } from './utils';

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

export async function deleteProduct(id: string) {
  try {
    const { error: syncLogsError } = await supabase
      .from('sync_logs')
      .delete()
      .eq('product_id', id);

    if (syncLogsError) throw syncLogsError;

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

export async function incrementProductSales(productId: string, quantity: number = 1) {
  try {
    console.log(`Product ${productId} sales incremented by ${quantity}`);
    return quantity;
  } catch (error) {
    console.error('Error incrementing product sales:', error);
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

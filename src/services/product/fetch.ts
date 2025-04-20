
import { supabase } from "@/integrations/supabase/client";
import { Product } from '@/types';
import { mapProductFromDatabase } from './utils';

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories:category_id(*)')
    .order('title', { ascending: true });
    
  if (error) throw error;
  return data?.map(mapProductFromDatabase) || [];
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
    
    return mapProductFromDatabase(data);
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
    
    return mapProductFromDatabase(data);
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    throw error;
  }
}

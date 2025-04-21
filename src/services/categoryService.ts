import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types";

interface CategoryWithParent extends Category {
  parent?: CategoryWithParent | null;
}

export const fetchAllCategories = async (): Promise<Category[]> => {
  try {
    console.log('Fetching all categories - Starting request');
    
    // Check if categories table is accessible
    const { error: checkError } = await supabase
      .from('categories')
      .select('count(*)', { count: 'exact', head: true });
      
    if (checkError) {
      console.error('Error checking categories access:', checkError.message, checkError.code, checkError.details);
      
      // Check if this is an RLS error
      if (checkError.message?.includes('permission denied') || checkError.code === 'PGRST301') {
        console.error('RLS ERROR: It appears Row Level Security is enabled on the categories table without proper policies for the anon role');
      }
    } else {
      console.log('Categories table is accessible');
    }
    
    // Only select essential fields and limit results to 100
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, description, slug, image, parent_id')
      .limit(100)
      .order('name');
      
    if (error) {
      console.error('Error in fetchAllCategories:', error.message, error.code, error.details);
      throw error;
    }
    
    // Log permissions info for debugging
    console.log(`Categories fetch successful: ${data?.length} items found. RLS might be active.`);
    
    // Add count property with default value 0 to match Category type
    return data?.map(item => ({ ...item, count: 0 })) || [];
  } catch (error: any) {
    console.error('Error fetching categories:', error?.message || error, error?.code, error?.details);
    return [];
  }
};

export const fetchMainCategories = async (): Promise<Category[]> => {
  try {
    console.log('Fetching main categories');
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, description, slug, image, parent_id')
      .is('parent_id', null)
      .limit(50)
      .order('name');
      
    if (error) {
      console.error('Error in fetchMainCategories:', error.message || error);
      throw error;
    }
    console.log('Main categories fetched:', data?.length);
    
    // Add count property with default value 0
    return data?.map(item => ({ ...item, count: 0 })) || [];
  } catch (error: any) {
    console.error('Error fetching main categories:', error?.message || error);
    return [];
  }
};

export const fetchSubcategoriesByParentId = async (parentId: string): Promise<Category[]> => {
  if (!parentId) {
    console.log('No parentId provided to fetchSubcategoriesByParentId');
    return [];
  }

  try {
    console.log(`Fetching subcategories for parent ${parentId}`);
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, description, slug, image, parent_id')
      .eq('parent_id', parentId)
      .limit(50)
      .order('name');
      
    if (error) {
      console.error('Error in fetchSubcategoriesByParentId:', error.message || error);
      throw error;
    }
    console.log(`Subcategories fetched for ${parentId}:`, data?.length);
    
    // Add count property with default value 0
    return data?.map(item => ({ ...item, count: 0 })) || [];
  } catch (error: any) {
    console.error(`Error fetching subcategories for parent ${parentId}:`, error?.message || error);
    return [];
  }
};

export const fetchCategoryBySlug = async (slug: string): Promise<Category | null> => {
  if (!slug) {
    console.log('No slug provided to fetchCategoryBySlug');
    return null;
  }

  try {
    console.log(`Fetching category with slug ${slug}`);
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, description, slug, image, parent_id')
      .eq('slug', slug)
      .maybeSingle();
      
    if (error) {
      console.error('Error in fetchCategoryBySlug:', error.message || error);
      throw error;
    }
    console.log(`Category fetch result for ${slug}:`, data ? 'Found' : 'Not found');
    
    // Add count property with default value 0 if data exists
    return data ? { ...data, count: 0 } : null;
  } catch (error: any) {
    console.error(`Error fetching category with slug ${slug}:`, error?.message || error);
    return null;
  }
};

export const fetchCategoryWithChildren = async (categoryId: string): Promise<{category: Category | null, subcategories: Category[]}> => {
  try {
    // Fetch the category
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, name, description, slug, image, parent_id')
      .eq('id', categoryId)
      .maybeSingle();
      
    if (categoryError) {
      console.error('Error fetching category:', categoryError.message || categoryError);
      throw categoryError;
    }
    
    // Fetch its subcategories
    const { data: subcategories, error: subError } = await supabase
      .from('categories')
      .select('id, name, description, slug, image, parent_id')
      .eq('parent_id', categoryId)
      .limit(50)
      .order('name');
      
    if (subError) {
      console.error('Error fetching subcategories:', subError.message || subError);
      throw subError;
    }
    
    // Add count property with default value 0
    return { 
      category: category ? { ...category, count: 0 } : null, 
      subcategories: subcategories?.map(item => ({ ...item, count: 0 })) || [] 
    };
  } catch (error: any) {
    console.error(`Error fetching category with children for ID ${categoryId}:`, error?.message || error);
    return { category: null, subcategories: [] };
  }
};

export const fetchCategoryHierarchy = async (slug?: string): Promise<CategoryWithParent | null> => {
  if (!slug) return null;
  
  try {
    // Fetch the category by slug
    const { data: category, error } = await supabase
      .from('categories')
      .select('id, name, description, slug, image, parent_id')
      .eq('slug', slug)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching category hierarchy:', error.message || error);
      throw error;
    }
    if (!category) return null;
    
    // Add count property with default value 0
    const categoryWithCount = { ...category, count: 0 };
    
    // If this category has a parent, fetch the parent details
    if (categoryWithCount.parent_id) {
      const { data: parent, error: parentError } = await supabase
        .from('categories')
        .select('id, name, description, slug, image, parent_id')
        .eq('id', categoryWithCount.parent_id)
        .maybeSingle();
      
      if (parentError) {
        console.error('Error fetching parent category:', parentError.message || parentError);
      }
      
      // Add count to parent if it exists
      return { 
        ...categoryWithCount,
        parent: parent ? { ...parent, count: 0 } : null
      };
    }
    
    return categoryWithCount as CategoryWithParent;
  } catch (error: any) {
    console.error(`Error fetching category hierarchy for slug ${slug}:`, error?.message || error);
    return null;
  }
};

import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types";

interface CategoryWithParent extends Category {
  parent?: CategoryWithParent | null;
}

export const fetchAllCategories = async (): Promise<Category[]> => {
  try {
    console.log('Fetching all categories - Starting request');
    
    // Only select essential fields instead of *
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, description, slug, image, parent_id')
      .order('name');
      
    if (error) {
      console.error('Error in fetchAllCategories:', error);
      throw error;
    }
    
    console.log('Categories fetch successful:', data?.length);
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const fetchMainCategories = async (): Promise<Category[]> => {
  try {
    console.log('Fetching main categories');
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('name');
      
    if (error) {
      console.error('Error in fetchMainCategories:', error);
      throw error;
    }
    console.log('Main categories fetched:', data?.length);
    return data || [];
  } catch (error) {
    console.error('Error fetching main categories:', error);
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
      .select('*')
      .eq('parent_id', parentId)
      .order('name');
      
    if (error) {
      console.error('Error in fetchSubcategoriesByParentId:', error);
      throw error;
    }
    console.log(`Subcategories fetched for ${parentId}:`, data?.length);
    return data || [];
  } catch (error) {
    console.error(`Error fetching subcategories for parent ${parentId}:`, error);
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
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
      
    if (error) {
      console.error('Error in fetchCategoryBySlug:', error);
      throw error;
    }
    console.log(`Category fetch result for ${slug}:`, data ? 'Found' : 'Not found');
    return data;
  } catch (error) {
    console.error(`Error fetching category with slug ${slug}:`, error);
    return null;
  }
};

export const fetchCategoryWithChildren = async (categoryId: string): Promise<{category: Category | null, subcategories: Category[]}> => {
  try {
    // Fetch the category
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .maybeSingle();
      
    if (categoryError) throw categoryError;
    
    // Fetch its subcategories
    const { data: subcategories, error: subError } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', categoryId)
      .order('name');
      
    if (subError) throw subError;
    
    return { 
      category, 
      subcategories: subcategories || [] 
    };
  } catch (error) {
    console.error(`Error fetching category with children for ID ${categoryId}:`, error);
    return { category: null, subcategories: [] };
  }
};

export const fetchCategoryHierarchy = async (slug?: string): Promise<CategoryWithParent | null> => {
  if (!slug) return null;
  
  try {
    // Fetch the category by slug
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
      
    if (error) throw error;
    if (!category) return null;
    
    // If this category has a parent, fetch the parent details
    if (category.parent_id) {
      const { data: parent } = await supabase
        .from('categories')
        .select('*')
        .eq('id', category.parent_id)
        .maybeSingle();
        
      return { ...category, parent: parent || null };
    }
    
    return category as CategoryWithParent;
  } catch (error) {
    console.error(`Error fetching category hierarchy for slug ${slug}:`, error);
    return null;
  }
};

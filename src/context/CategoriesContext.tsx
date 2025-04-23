
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types'; // Make sure we use the same Category type

// Define the context shape
interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
}

// Create the context
const CategoriesContext = createContext<CategoriesContextType>({
  categories: [],
  loading: false,
  error: null,
  fetchCategories: async () => {}
});

// Custom hook to use the context
export const useCategoriesContext = () => useContext(CategoriesContext);

// Provider component
export const CategoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      // Convert to Category type
      const formattedCategories: Category[] = data.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        count: cat.count || 0,
        parent_id: cat.parent_id,
        created_at: cat.created_at,
        updated_at: cat.updated_at
      }));
      
      setCategories(formattedCategories);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoriesContext.Provider value={{ categories, loading, error, fetchCategories }}>
      {children}
    </CategoriesContext.Provider>
  );
};

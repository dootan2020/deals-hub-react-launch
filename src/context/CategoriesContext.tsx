
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category } from '@/types';
import { fetchAllCategories } from '@/services/categoryService';
import { useToast } from '@/hooks/use-toast';

interface CategoryContextType {
  categories: Category[];
  mainCategories: Category[];
  getCategoryById: (id: string) => Category | undefined;
  getSubcategoriesByParentId: (parentId: string) => Category[];
  isLoading: boolean;
  error: Error | null;
  refreshCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoryContextType | undefined>(undefined);

export const useCategoriesContext = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategoriesContext must be used within a CategoriesProvider');
  }
  return context;
};

interface CategoriesProviderProps {
  children: ReactNode;
}

export const CategoriesProvider = ({ children }: CategoriesProviderProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchAllCategories();
      setCategories(data);
      
      // Filter main categories (those without parent_id)
      const main = data.filter(category => !category.parent_id);
      setMainCategories(main);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
      toast({
        title: "Error loading menu categories",
        description: "There was a problem loading the menu structure. Please try refreshing the page.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  const getSubcategoriesByParentId = (parentId: string) => {
    return categories.filter(category => category.parent_id === parentId);
  };

  const refreshCategories = async () => {
    await loadCategories();
  };

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        mainCategories,
        getCategoryById,
        getSubcategoriesByParentId,
        isLoading,
        error,
        refreshCategories
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

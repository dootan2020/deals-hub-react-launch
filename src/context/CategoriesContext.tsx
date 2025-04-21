
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category } from '@/types';
import { fetchAllCategories } from '@/services/categoryService';
import { toast } from '@/hooks/use-toast';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';

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
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Attempting to load categories (attempt: ${retryCount + 1}/${maxRetries + 1})`);
      
      // Use our updated fetchWithTimeout utility
      const data = await fetchWithTimeout(
        fetchAllCategories(),
        15000, // Increased timeout to 15 seconds
        'Quá thời gian tải danh mục'
      );
      
      console.log('Categories loaded successfully:', data?.length || 0);
      setCategories(data || []);
      
      // Filter main categories (those without parent_id)
      const main = data.filter(category => !category.parent_id);
      setMainCategories(main);
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Không thể tải danh mục');
      setError(errorMessage);
      console.error('Lỗi tải danh mục:', err);
      
      // Show toast notification
      toast.error('Lỗi tải dữ liệu', 'Không thể tải cấu trúc menu. Vui lòng thử lại sau.');
      
      // Auto-retry logic (but limited to prevent infinite loops)
      if (retryCount < maxRetries) {
        console.log(`Will retry in 2 seconds... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [retryCount]);

  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  const getSubcategoriesByParentId = (parentId: string) => {
    return categories.filter(category => category.parent_id === parentId);
  };

  const refreshCategories = async () => {
    setRetryCount(0); // Reset retry count on manual refresh
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

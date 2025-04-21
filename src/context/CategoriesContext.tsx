
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

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use our new fetchWithTimeout utility
      const data = await fetchWithTimeout(
        fetchAllCategories(),
        7000,
        'Quá thời gian tải danh mục'
      );
      
      setCategories(data || []);
      
      // Lọc danh mục chính (những danh mục không có parent_id)
      const main = data.filter(category => !category.parent_id);
      setMainCategories(main);
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Không thể tải danh mục');
      setError(errorMessage);
      console.error('Lỗi tải danh mục:', err);
      toast.error('Lỗi tải dữ liệu', 'Không thể tải cấu trúc menu. Vui lòng thử lại sau.');
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


import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category } from '@/types';
import { fetchAllCategories } from '@/services/categoryService';
import { toast } from '@/hooks/use-toast';

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
      // Thêm timeout để tránh loading mãi mãi
      const categoryPromise = fetchAllCategories();
      const timeoutPromise = new Promise<Category[]>((_, reject) => 
        setTimeout(() => reject(new Error('Quá thời gian tải danh mục')), 10000)
      );
      
      const data = await Promise.race([categoryPromise, timeoutPromise]);
      
      setCategories(data || []);
      
      // Lọc danh mục chính (những danh mục không có parent_id)
      const main = data.filter(category => !category.parent_id);
      setMainCategories(main);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Không thể tải danh mục'));
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

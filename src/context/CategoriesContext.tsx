
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

// Define a simple Category type
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

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

// Mock categories for demo purposes
const mockCategories: Category[] = [
  { id: '1', name: 'Email Accounts', slug: 'email-accounts', isActive: true, sortOrder: 1 },
  { id: '2', name: 'Social Media Accounts', slug: 'social-media-accounts', isActive: true, sortOrder: 2 },
  { id: '3', name: 'Software Keys', slug: 'software-keys', isActive: true, sortOrder: 3 },
  { id: '4', name: 'Digital Services', slug: 'digital-services', isActive: true, sortOrder: 4 },
  { id: '5', name: 'Gmail', slug: 'gmail', parentId: '1', isActive: true, sortOrder: 1 },
  { id: '6', name: 'Outlook', slug: 'outlook', parentId: '1', isActive: true, sortOrder: 2 },
  { id: '7', name: 'Facebook', slug: 'facebook', parentId: '2', isActive: true, sortOrder: 1 },
  { id: '8', name: 'Instagram', slug: 'instagram', parentId: '2', isActive: true, sortOrder: 2 },
  { id: '9', name: 'Windows', slug: 'windows', parentId: '3', isActive: true, sortOrder: 1 },
  { id: '10', name: 'Office', slug: 'office', parentId: '3', isActive: true, sortOrder: 2 },
];

export const CategoriesProvider = ({ children }: CategoriesProviderProps) => {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would fetch from API
      // For now, just use the mock data
      
      // Filter main categories (those without parentId)
      const main = mockCategories.filter(category => !category.parentId);
      setMainCategories(main);
      setCategories(mockCategories);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
      toast({
        title: "Error",
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
    return categories.filter(category => category.parentId === parentId);
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

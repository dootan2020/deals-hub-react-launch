
import { useState } from 'react';
import { Product } from '@/types';
import { CategoryWithParent } from '@/types/category.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Filter } from 'lucide-react';
import EnhancedProductGrid from '@/components/product/EnhancedProductGrid';

interface CategoryProductsTabProps {
  category: CategoryWithParent | null;
  products: Product[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const CategoryProductsTab = ({
  category,
  products,
  isLoading,
  currentPage,
  totalPages,
  onPageChange
}: CategoryProductsTabProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Products</h2>
        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center space-x-1 border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-2"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-2"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={toggleMobileFilters}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <EnhancedProductGrid 
        products={products}
        showSort={false}
        paginationType="pagination"
        viewMode={viewMode}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

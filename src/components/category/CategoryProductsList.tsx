
import React from 'react';
import { Product } from '@/types';
import ProductGrid from '@/components/product/ProductGrid';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface CategoryProductsListProps {
  products: Product[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const CategoryProductsList: React.FC<CategoryProductsListProps> = ({
  products,
  totalProducts,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div>
      {products.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-text-light">{totalProducts} products found</p>
            <div className="flex items-center">
              <span className="mr-2 text-text-light">Sort by:</span>
              <select className="border border-gray-200 rounded p-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option>Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
                <option>Rating</option>
              </select>
            </div>
          </div>
          
          <ProductGrid products={products} />
          
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => onPageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={currentPage === i + 1}
                        onClick={() => onPageChange(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => onPageChange(currentPage + 1)}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl font-medium mb-2">No products found</p>
          <p className="text-text-light">
            Try adjusting your filters or check back later for new products.
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryProductsList;


import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal 
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

export interface FilterOptions {
  priceRanges: string[];
  ratingOptions: string[];
  inStock: boolean;
}

interface CategoryFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  filters: FilterOptions;
  totalProducts: number;
}

const CategoryFilters = ({ onFilterChange, filters, totalProducts }: CategoryFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  
  const handlePriceChange = (range: string) => {
    let updatedPriceRanges = [...filters.priceRanges];
    
    if (updatedPriceRanges.includes(range)) {
      updatedPriceRanges = updatedPriceRanges.filter(r => r !== range);
    } else {
      updatedPriceRanges.push(range);
    }
    
    onFilterChange({
      ...filters,
      priceRanges: updatedPriceRanges
    });
  };
  
  const handleRatingChange = (rating: string) => {
    let updatedRatingOptions = [...filters.ratingOptions];
    
    if (updatedRatingOptions.includes(rating)) {
      updatedRatingOptions = updatedRatingOptions.filter(r => r !== rating);
    } else {
      updatedRatingOptions.push(rating);
    }
    
    onFilterChange({
      ...filters,
      ratingOptions: updatedRatingOptions
    });
  };
  
  const handleStockChange = (inStock: boolean) => {
    onFilterChange({
      ...filters,
      inStock
    });
  };
  
  const clearAllFilters = () => {
    onFilterChange({
      priceRanges: [],
      ratingOptions: [],
      inStock: false
    });
  };
  
  const hasActiveFilters = filters.priceRanges.length > 0 || 
                          filters.ratingOptions.length > 0 || 
                          filters.inStock;

  return (
    <>
      <div className="md:hidden mb-4">
        <Collapsible>
          <CollapsibleTrigger asChild>
            <button
              className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
            >
              <div className="flex items-center">
                <SlidersHorizontal className="h-5 w-5 mr-2 text-text-light" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="ml-2 bg-primary text-white text-xs rounded-full px-2 py-0.5">
                    {(filters.priceRanges.length + filters.ratingOptions.length + (filters.inStock ? 1 : 0))}
                  </span>
                )}
              </div>
              {showFilters ? (
                <ChevronUp className="h-5 w-5 text-text-light" />
              ) : (
                <ChevronDown className="h-5 w-5 text-text-light" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 border border-t-0 border-gray-200 rounded-b-md bg-white">
              <MobileFiltersContent 
                filters={filters}
                onPriceChange={handlePriceChange}
                onRatingChange={handleRatingChange}
                onStockChange={handleStockChange}
                onClearFilters={clearAllFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="hidden md:block">
        <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Filters</h2>
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllFilters}
                className="text-xs text-primary hover:text-primary-dark hover:bg-primary-50"
              >
                Clear All
              </Button>
            )}
          </div>
          
          <Accordion type="multiple" defaultValue={["price", "rating", "availability"]}>
            <AccordionItem value="price">
              <AccordionTrigger>Price Range</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      checked={filters.priceRanges.includes('under25')}
                      onChange={() => handlePriceChange('under25')}
                    />
                    <span className="ml-2 text-text-light">Under $25</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      checked={filters.priceRanges.includes('25to50')}
                      onChange={() => handlePriceChange('25to50')}
                    />
                    <span className="ml-2 text-text-light">$25 - $50</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      checked={filters.priceRanges.includes('50to100')}
                      onChange={() => handlePriceChange('50to100')}
                    />
                    <span className="ml-2 text-text-light">$50 - $100</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      checked={filters.priceRanges.includes('over100')}
                      onChange={() => handlePriceChange('over100')}
                    />
                    <span className="ml-2 text-text-light">Over $100</span>
                  </label>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="rating">
              <AccordionTrigger>Rating</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      checked={filters.ratingOptions.includes('4star')}
                      onChange={() => handleRatingChange('4star')}
                    />
                    <span className="ml-2 text-text-light">4 Stars & Up</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      checked={filters.ratingOptions.includes('3star')}
                      onChange={() => handleRatingChange('3star')}
                    />
                    <span className="ml-2 text-text-light">3 Stars & Up</span>
                  </label>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="availability">
              <AccordionTrigger>Availability</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      checked={filters.inStock}
                      onChange={() => handleStockChange(!filters.inStock)}
                    />
                    <span className="ml-2 text-text-light">In Stock</span>
                  </label>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  );
};

interface MobileFiltersContentProps {
  filters: FilterOptions;
  onPriceChange: (range: string) => void;
  onRatingChange: (rating: string) => void;
  onStockChange: (inStock: boolean) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const MobileFiltersContent = ({ 
  filters,
  onPriceChange,
  onRatingChange,
  onStockChange,
  onClearFilters,
  hasActiveFilters
}: MobileFiltersContentProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Price Range</h3>
        {filters.priceRanges.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onClearFilters()}
            className="text-xs text-primary hover:text-primary-dark"
          >
            Clear
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="flex items-center">
          <input 
            type="checkbox" 
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            checked={filters.priceRanges.includes('under25')}
            onChange={() => onPriceChange('under25')}
          />
          <span className="ml-2 text-text-light">Under $25</span>
        </label>
        <label className="flex items-center">
          <input 
            type="checkbox" 
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            checked={filters.priceRanges.includes('25to50')}
            onChange={() => onPriceChange('25to50')}
          />
          <span className="ml-2 text-text-light">$25 - $50</span>
        </label>
        <label className="flex items-center">
          <input 
            type="checkbox" 
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            checked={filters.priceRanges.includes('50to100')}
            onChange={() => onPriceChange('50to100')}
          />
          <span className="ml-2 text-text-light">$50 - $100</span>
        </label>
        <label className="flex items-center">
          <input 
            type="checkbox" 
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            checked={filters.priceRanges.includes('over100')}
            onChange={() => onPriceChange('over100')}
          />
          <span className="ml-2 text-text-light">Over $100</span>
        </label>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Rating</h3>
          {filters.ratingOptions.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onClearFilters()}
              className="text-xs text-primary hover:text-primary-dark"
            >
              Clear
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="flex items-center">
            <input 
              type="checkbox" 
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              checked={filters.ratingOptions.includes('4star')}
              onChange={() => onRatingChange('4star')}
            />
            <span className="ml-2 text-text-light">4 Stars & Up</span>
          </label>
          <label className="flex items-center">
            <input 
              type="checkbox" 
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              checked={filters.ratingOptions.includes('3star')}
              onChange={() => onRatingChange('3star')}
            />
            <span className="ml-2 text-text-light">3 Stars & Up</span>
          </label>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h3 className="font-medium mb-2">Availability</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input 
              type="checkbox" 
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              checked={filters.inStock}
              onChange={() => onStockChange(!filters.inStock)}
            />
            <span className="ml-2 text-text-light">In Stock</span>
          </label>
        </div>
      </div>
      
      {hasActiveFilters && (
        <Button 
          onClick={onClearFilters}
          variant="outline"
          className="w-full mt-4"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );
};

export default CategoryFilters;

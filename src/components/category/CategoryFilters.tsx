
import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from '@/components/ui/separator';
import { FilterParams } from '@/types';

interface CategoryFiltersProps {
  onFilterChange: (filters: FilterParams) => void;
  activeFilters: FilterParams;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({ onFilterChange, activeFilters }) => {
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isRatingOpen, setIsRatingOpen] = useState(true);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(true);
  
  // Price range state
  const [minPrice, setMinPrice] = useState<string>(activeFilters.priceRange?.[0] || '');
  const [maxPrice, setMaxPrice] = useState<string>(activeFilters.priceRange?.[1] || '');
  
  // Rating state
  const [selectedRatings, setSelectedRatings] = useState<string[]>(
    activeFilters.rating || []
  );
  
  // Stock state
  const [inStock, setInStock] = useState<boolean | undefined>(
    activeFilters.inStock
  );

  // Apply price range filter
  const handlePriceFilter = () => {
    if (minPrice === '' && maxPrice === '') {
      onFilterChange({ priceRange: undefined });
      return;
    }
    
    onFilterChange({
      priceRange: [minPrice || '0', maxPrice || '999999']
    });
  };
  
  // Apply rating filter
  const handleRatingToggle = (rating: string) => {
    let newRatings: string[];
    
    if (selectedRatings.includes(rating)) {
      newRatings = selectedRatings.filter(r => r !== rating);
    } else {
      newRatings = [...selectedRatings, rating];
    }
    
    setSelectedRatings(newRatings);
    onFilterChange({ 
      rating: newRatings.length > 0 ? newRatings : undefined 
    });
  };
  
  // Apply in-stock filter
  const handleStockToggle = (value: boolean | undefined) => {
    setInStock(value);
    onFilterChange({ inStock: value });
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedRatings([]);
    setInStock(undefined);
    
    onFilterChange({
      priceRange: undefined,
      rating: undefined,
      inStock: undefined
    });
  };
  
  // Check if any filters are active
  const hasActiveFilters = 
    activeFilters.priceRange !== undefined || 
    (activeFilters.rating !== undefined && activeFilters.rating.length > 0) || 
    activeFilters.inStock !== undefined;
  
  // Filter section component
  const FilterSection = ({ 
    title, 
    isOpen, 
    setIsOpen, 
    children 
  }: { 
    title: string; 
    isOpen: boolean; 
    setIsOpen: (value: boolean) => void; 
    children: React.ReactNode;
  }) => (
    <div className="mb-6">
      <div 
        className="flex justify-between items-center cursor-pointer mb-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-medium text-lg">{title}</h3>
        <button className="text-gray-500">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      {isOpen && children}
      
      <Separator className="mt-4" />
    </div>
  );
  
  // Mobile filter sheet component
  const MobileFilters = () => (
    <div className="lg:hidden mb-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full flex justify-between">
            <span className="flex items-center">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </span>
            {hasActiveFilters && (
              <span className="bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                !
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh]">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Apply filters to narrow down your search results
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-4">
            {FiltersContent()}
            
            <div className="flex gap-2 mt-6">
              <Button 
                onClick={clearAllFilters} 
                variant="outline" 
                className="flex-1"
                disabled={!hasActiveFilters}
              >
                Clear All
              </Button>
              <Button 
                onClick={() => onFilterChange({ ...activeFilters })}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
  
  // Filters content (used in both desktop and mobile views)
  const FiltersContent = () => (
    <>
      <FilterSection 
        title="Price Range" 
        isOpen={isPriceOpen} 
        setIsOpen={setIsPriceOpen}
      >
        <div className="flex flex-col space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm text-gray-600">Min</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Max</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
              />
            </div>
          </div>
          <Button 
            onClick={handlePriceFilter}
            size="sm"
          >
            Apply
          </Button>
        </div>
      </FilterSection>
      
      <FilterSection 
        title="Rating" 
        isOpen={isRatingOpen} 
        setIsOpen={setIsRatingOpen}
      >
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div 
              key={rating}
              className="flex items-center cursor-pointer"
              onClick={() => handleRatingToggle(rating.toString())}
            >
              <div className={`
                w-4 h-4 border rounded mr-2 flex items-center justify-center
                ${selectedRatings.includes(rating.toString()) 
                  ? 'bg-primary border-primary' 
                  : 'border-gray-300'}
              `}>
                {selectedRatings.includes(rating.toString()) && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span 
                    key={index}
                    className={`text-lg ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </span>
                ))}
                <span className="text-sm text-gray-600 ml-1">
                  {rating === 1 ? '& Up' : `& Up`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </FilterSection>
      
      <FilterSection 
        title="Availability" 
        isOpen={isAvailabilityOpen} 
        setIsOpen={setIsAvailabilityOpen}
      >
        <div className="space-y-2">
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => handleStockToggle(true)}
          >
            <div className={`
              w-4 h-4 border rounded mr-2 flex items-center justify-center
              ${inStock === true ? 'bg-primary border-primary' : 'border-gray-300'}
            `}>
              {inStock === true && (
                <Check className="h-3 w-3 text-white" />
              )}
            </div>
            <span>In Stock</span>
          </div>
          
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => handleStockToggle(false)}
          >
            <div className={`
              w-4 h-4 border rounded mr-2 flex items-center justify-center
              ${inStock === false ? 'bg-primary border-primary' : 'border-gray-300'}
            `}>
              {inStock === false && (
                <Check className="h-3 w-3 text-white" />
              )}
            </div>
            <span>Out of Stock</span>
          </div>
          
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => handleStockToggle(undefined)}
          >
            <div className={`
              w-4 h-4 border rounded mr-2 flex items-center justify-center
              ${inStock === undefined ? 'bg-primary border-primary' : 'border-gray-300'}
            `}>
              {inStock === undefined && (
                <Check className="h-3 w-3 text-white" />
              )}
            </div>
            <span>Show All</span>
          </div>
        </div>
      </FilterSection>
      
      {hasActiveFilters && (
        <div className="mt-4">
          <button
            onClick={clearAllFilters}
            className="text-primary flex items-center text-sm font-medium hover:underline"
          >
            <X size={16} className="mr-1" />
            Clear All Filters
          </button>
        </div>
      )}
    </>
  );
  
  return (
    <div>
      <MobileFilters />
      
      <div className="hidden lg:block">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <SlidersHorizontal className="mr-2 h-5 w-5" />
              Filters
            </h2>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-primary text-sm hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
          
          <Separator className="mb-4" />
          
          {FiltersContent()}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilters;

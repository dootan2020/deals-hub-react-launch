import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FilterParams } from '@/types';

interface CategoryFiltersProps {
  onFilterChange: (filters: FilterParams) => void;
  activeFilters: FilterParams;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({ onFilterChange, activeFilters }) => {
  // Price range state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minPrice, setMinPrice] = useState<string>(activeFilters.priceRange?.[0]?.toString() || '0');
  const [maxPrice, setMaxPrice] = useState<string>(activeFilters.priceRange?.[1]?.toString() || '1000');
  
  // Rating state
  const [ratings, setRatings] = useState<string[]>(activeFilters.rating || []);
  
  // In stock state
  const [inStock, setInStock] = useState<boolean | undefined>(activeFilters.inStock);
  
  // Accordion states
  const [priceOpen, setPriceOpen] = useState(true);
  const [ratingsOpen, setRatingsOpen] = useState(true);
  const [availabilityOpen, setAvailabilityOpen] = useState(true);

  // Update local state when activeFilters change
  useEffect(() => {
    if (activeFilters.priceRange) {
      setPriceRange([Number(activeFilters.priceRange[0]), Number(activeFilters.priceRange[1])]);
      setMinPrice(activeFilters.priceRange[0].toString());
      setMaxPrice(activeFilters.priceRange[1].toString());
    }
    
    if (activeFilters.rating) {
      setRatings(activeFilters.rating);
    } else {
      setRatings([]);
    }
    
    setInStock(activeFilters.inStock);
  }, [activeFilters]);

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinPrice(value);
    if (value === '' || isNaN(Number(value))) return;
    
    const numValue = Number(value);
    if (numValue >= 0 && numValue <= Number(maxPrice)) {
      setPriceRange([numValue, priceRange[1]]);
    }
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxPrice(value);
    if (value === '' || isNaN(Number(value))) return;
    
    const numValue = Number(value);
    if (numValue >= Number(minPrice)) {
      setPriceRange([priceRange[0], numValue]);
    }
  };
  
  const toggleRating = (rating: string) => {
    setRatings(prev => {
      if (prev.includes(rating)) {
        return prev.filter(r => r !== rating);
      } else {
        return [...prev, rating];
      }
    });
  };
  
  const toggleInStock = () => {
    setInStock(prev => {
      // If it's undefined or false, make it true
      // If it's true, make it undefined (not filtering)
      return prev === true ? undefined : true;
    });
  };
  
  const handleApplyFilters = () => {
    const filters: FilterParams = {};
    
    // Apply price range filter if both values are valid
    if (minPrice !== '' && maxPrice !== '' && !isNaN(Number(minPrice)) && !isNaN(Number(maxPrice))) {
      filters.priceRange = [minPrice, maxPrice];
    }
    
    // Apply rating filter if any ratings selected
    if (ratings.length > 0) {
      filters.rating = ratings;
    }
    
    // Apply in stock filter if set
    if (inStock !== undefined) {
      filters.inStock = inStock;
    }
    
    // Maintain the current sort option if it exists
    if (activeFilters.sort) {
      filters.sort = activeFilters.sort;
    }
    
    // Maintain the current category ID if it exists
    if (activeFilters.categoryId) {
      filters.categoryId = activeFilters.categoryId;
    }
    
    onFilterChange(filters);
  };
  
  const handleResetFilters = () => {
    // Reset local state
    setPriceRange([0, 1000]);
    setMinPrice('0');
    setMaxPrice('1000');
    setRatings([]);
    setInStock(undefined);
    
    // Remove all filters but keep sort and categoryId
    const resetFilters: FilterParams = {};
    
    if (activeFilters.sort) {
      resetFilters.sort = activeFilters.sort;
    }
    
    if (activeFilters.categoryId) {
      resetFilters.categoryId = activeFilters.categoryId;
    }
    
    onFilterChange(resetFilters);
  };

  return (
    <div className="space-y-6">
      {/* Price Range Filter */}
      <div className="pb-4">
        <button 
          className="flex w-full items-center justify-between"
          onClick={() => setPriceOpen(!priceOpen)}
        >
          <h3 className="text-base font-medium">Price Range</h3>
          {priceOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        {priceOpen && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-full">
                <label htmlFor="min-price" className="block text-sm text-gray-500 mb-1">
                  Min Price
                </label>
                <input
                  id="min-price"
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={handleMinPriceChange}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                />
              </div>
              <span className="pt-5">-</span>
              <div className="w-full">
                <label htmlFor="max-price" className="block text-sm text-gray-500 mb-1">
                  Max Price
                </label>
                <input
                  id="max-price"
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Separator />
      
      {/* Rating Filter */}
      <div className="pb-4">
        <button 
          className="flex w-full items-center justify-between"
          onClick={() => setRatingsOpen(!ratingsOpen)}
        >
          <h3 className="text-base font-medium">Rating</h3>
          {ratingsOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        {ratingsOpen && (
          <div className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => toggleRating(rating.toString())}
                className={`flex w-full items-center justify-between p-2 rounded-md ${
                  ratings.includes(rating.toString())
                    ? 'bg-primary-50 text-primary'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ${
                          i < rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-1 text-sm">
                    {rating === 5 ? '& Up' : '& Up'}
                  </span>
                </div>
                {ratings.includes(rating.toString()) && (
                  <Check className="h-4 w-4" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <Separator />
      
      {/* Availability Filter */}
      <div className="pb-4">
        <button 
          className="flex w-full items-center justify-between"
          onClick={() => setAvailabilityOpen(!availabilityOpen)}
        >
          <h3 className="text-base font-medium">Availability</h3>
          {availabilityOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        {availabilityOpen && (
          <div className="mt-4">
            <button
              onClick={toggleInStock}
              className={`flex w-full items-center justify-between p-2 rounded-md ${
                inStock === true
                  ? 'bg-primary-50 text-primary'
                  : 'hover:bg-gray-50'
              }`}
            >
              <span>In Stock Only</span>
              {inStock === true && <Check className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>
      
      <Separator />
      
      {/* Filter Actions */}
      <div className="flex flex-col space-y-2 pt-2">
        <Button 
          onClick={handleApplyFilters}
          className="w-full bg-primary hover:bg-primary-dark text-white"
        >
          Apply Filters
        </Button>
        <Button
          onClick={handleResetFilters}
          variant="outline"
          className="w-full"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default CategoryFilters;

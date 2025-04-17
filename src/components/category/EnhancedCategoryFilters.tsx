import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, ChevronUp, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FilterParams } from '@/types';

interface EnhancedCategoryFiltersProps {
  onFilterChange: (filters: FilterParams) => void;
  activeFilters: FilterParams;
  onToggleMobileFilters?: () => void;
  isMobileFilterOpen?: boolean;
}

const EnhancedCategoryFilters: React.FC<EnhancedCategoryFiltersProps> = ({
  onFilterChange,
  activeFilters,
  onToggleMobileFilters,
  isMobileFilterOpen
}) => {
  // Price range state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minPrice, setMinPrice] = useState<string>(activeFilters.priceRange?.[0]?.toString() || '0');
  const [maxPrice, setMaxPrice] = useState<string>(activeFilters.priceRange?.[1]?.toString() || '1000');
  
  // Rating state
  const [ratings, setRatings] = useState<string[]>(activeFilters.rating || []);
  
  // In stock state
  const [inStock, setInStock] = useState<boolean | undefined>(activeFilters.inStock);

  // Availability state
  const [availability, setAvailability] = useState<string | null>(null);
  
  // Accordion states
  const [priceOpen, setPriceOpen] = useState(true);
  const [ratingsOpen, setRatingsOpen] = useState(true);
  const [availabilityOpen, setAvailabilityOpen] = useState(true);
  const [brandOpen, setBrandOpen] = useState(false);

  // Active filter count
  const [activeFilterCount, setActiveFilterCount] = useState(0);

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

    // Count active filters
    let count = 0;
    if (activeFilters.priceRange) count++;
    if (activeFilters.rating && activeFilters.rating.length > 0) count++;
    if (activeFilters.inStock !== undefined) count++;
    setActiveFilterCount(count);

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

  const handleAvailabilityChange = (value: string) => {
    if (value === availability) {
      setAvailability(null);
      setInStock(undefined);
    } else {
      setAvailability(value);
      setInStock(value === 'in-stock');
    }
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
    
    // Close mobile filters if they're open
    if (isMobileFilterOpen && onToggleMobileFilters) {
      onToggleMobileFilters();
    }
  };
  
  const handleResetFilters = () => {
    // Reset local state
    setPriceRange([0, 1000]);
    setMinPrice('0');
    setMaxPrice('1000');
    setRatings([]);
    setInStock(undefined);
    setAvailability(null);
    
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

  const clearSingleFilter = (filterType: 'price' | 'rating' | 'stock') => {
    const newFilters = { ...activeFilters };
    
    if (filterType === 'price') {
      delete newFilters.priceRange;
      setPriceRange([0, 1000]);
      setMinPrice('0');
      setMaxPrice('1000');
    }
    else if (filterType === 'rating') {
      delete newFilters.rating;
      setRatings([]);
    }
    else if (filterType === 'stock') {
      delete newFilters.inStock;
      setInStock(undefined);
      setAvailability(null);
    }
    
    onFilterChange(newFilters);
  };

  // Mobile filter toggle
  const renderMobileFilterToggle = () => {
    if (!onToggleMobileFilters) return null;
    
    return (
      <div className="md:hidden mb-4">
        <Button
          onClick={onToggleMobileFilters}
          variant="outline"
          className="w-full justify-between"
        >
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">{activeFilterCount}</Badge>
            )}
          </div>
          {isMobileFilterOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  };

  // Active filters display
  const renderActiveFilters = () => {
    if (
      (!activeFilters.priceRange && !activeFilters.rating?.length && activeFilters.inStock === undefined) ||
      activeFilterCount === 0
    ) {
      return null;
    }

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Active Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-xs h-6 px-2"
          >
            Clear all
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeFilters.priceRange && (
            <Badge variant="outline" className="flex items-center gap-1 bg-gray-50">
              Price: ${activeFilters.priceRange[0]} - ${activeFilters.priceRange[1]}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearSingleFilter('price')}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove price filter</span>
              </Button>
            </Badge>
          )}
          
          {activeFilters.rating && activeFilters.rating.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 bg-gray-50">
              Rating: {Math.min(...activeFilters.rating.map(Number))}+ stars
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearSingleFilter('rating')}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove rating filter</span>
              </Button>
            </Badge>
          )}
          
          {activeFilters.inStock !== undefined && (
            <Badge variant="outline" className="flex items-center gap-1 bg-gray-50">
              In stock only
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearSingleFilter('stock')}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove in stock filter</span>
              </Button>
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderMobileFilterToggle()}
      {renderActiveFilters()}

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

            <div className="px-1">
              <input 
                type="range" 
                min="0" 
                max="1000" 
                value={priceRange[0]} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= priceRange[1]) {
                    setPriceRange([val, priceRange[1]]);
                    setMinPrice(val.toString());
                  }
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-primary"
              />
              <input 
                type="range" 
                min="0" 
                max="1000" 
                value={priceRange[1]} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= priceRange[0]) {
                    setPriceRange([priceRange[0], val]);
                    setMaxPrice(val.toString());
                  }
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-primary mt-2"
              />
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
                    ? 'bg-primary/10 text-primary'
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
                  <span className="ml-2 text-sm">
                    {rating === 5 ? '5 Stars' : `${rating} Stars & Up`}
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
          <div className="mt-4 space-y-2">
            <RadioGroup value={availability || ''} onValueChange={handleAvailabilityChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in-stock" id="in-stock" />
                <label htmlFor="in-stock" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  In stock only
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <label htmlFor="all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Show all products
                </label>
              </div>
            </RadioGroup>
          </div>
        )}
      </div>
      
      <Separator />

      {/* Brand Filter - example of additional filter */}
      <div className="pb-4">
        <button 
          className="flex w-full items-center justify-between"
          onClick={() => setBrandOpen(!brandOpen)}
        >
          <h3 className="text-base font-medium">Brand</h3>
          {brandOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        {brandOpen && (
          <div className="mt-4 space-y-2">
            {['All Brands', 'Google', 'Microsoft', 'Apple', 'Samsung', 'Meta'].map((brand) => (
              <div key={brand} className="flex items-center">
                <input
                  id={`brand-${brand}`}
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor={`brand-${brand}`} className="ml-2 text-sm text-gray-600">
                  {brand}
                </label>
              </div>
            ))}
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

export default EnhancedCategoryFilters;

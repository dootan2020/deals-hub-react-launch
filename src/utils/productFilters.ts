
import { SortOption } from '@/types';

// Export SortOption type for use in components
export { SortOption };

/**
 * Get the display name for a sort option
 */
export const getSortOptionDisplayName = (option: SortOption): string => {
  switch (option) {
    case 'popular':
      return 'Popularity';
    case 'price-low':
      return 'Price: Low to High';
    case 'price-high':
      return 'Price: High to Low';
    case 'newest':
      return 'Newest First';
    case 'recommended':
      return 'Recommended';
    default:
      return 'Newest First';
  }
};

/**
 * Get available sort options
 */
export const getSortOptions = (): { value: SortOption, label: string }[] => {
  return [
    { value: 'recommended', label: 'Recommended' },
    { value: 'popular', label: 'Popularity' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' }
  ];
};

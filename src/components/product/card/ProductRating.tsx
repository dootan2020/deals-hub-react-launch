
import { Star } from 'lucide-react';

interface ProductRatingProps {
  rating: number;
  reviewCount: number;
}

const ProductRating = ({ rating, reviewCount }: ProductRatingProps) => {
  return (
    <div className="flex items-center mb-2">
      <div className="flex mr-2">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${
              i < Math.floor(rating) 
                ? "text-[#F59E0B] fill-[#F59E0B]" 
                : "text-gray-400"
            }`} 
          />
        ))}
      </div>
      <span className="text-xs text-text-light">
        ({reviewCount})
      </span>
    </div>
  );
};

export default ProductRating;

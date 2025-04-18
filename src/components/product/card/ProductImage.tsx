
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductImageProps {
  product: Product;
  isHovered: boolean;
}

const ProductImage = ({ product, isHovered }: ProductImageProps) => {
  return (
    <div className="relative h-60 bg-[#F3F4F6] overflow-hidden">
      <img
        src={product.images[0]}
        alt={product.title}
        className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
        onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
      />
      
      {/* Quick action buttons on hover */}
      <div className={`absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <Link to={`/product/${product.slug}`}>
          <Button size="sm" variant="secondary" className="rounded-full p-2 bg-white text-text hover:bg-[#F3F4F6]">
            <Eye className="h-4 w-4" />
            <span className="sr-only">Quick view</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProductImage;

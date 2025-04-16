
import { Product } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  title?: string;
  description?: string;
}

const ProductGrid = ({ products, title, description }: ProductGridProps) => {
  return (
    <div>
      {(title || description) && (
        <div className="mb-8">
          {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
          {description && <p className="text-text-light">{description}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;


import React from 'react';
import { Product } from '@/types';
import { Link } from 'react-router-dom';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-72"></div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <Link 
          key={product.id} 
          to={`/product/${product.slug}`}
          className="group bg-white overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all"
        >
          <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-200">
            {product.images && product.images[0] && (
              <img
                src={product.images[0]}
                alt={product.title}
                className="h-full w-full object-cover object-center group-hover:opacity-90 transition-opacity"
              />
            )}
          </div>
          <div className="p-4">
            <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
              {product.title}
            </h3>
            <div className="mt-2 flex justify-between items-center">
              <p className="font-bold text-primary">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(product.price)}
              </p>
              <span className={`text-xs px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductGrid;

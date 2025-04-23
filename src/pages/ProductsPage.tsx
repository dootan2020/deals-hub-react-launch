
import React, { useEffect, useState } from 'react';
import { fetchProducts } from '@/services/product';
import { Product } from '@/types';
import ProductGrid from '@/components/product/ProductGrid';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data.products);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>
      <ProductGrid products={products} loading={loading} />
    </div>
  );
};

export default ProductsPage;

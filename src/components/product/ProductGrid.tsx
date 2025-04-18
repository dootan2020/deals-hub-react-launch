
import React from 'react';

// Empty product grid component - placeholder after deletion
const ProductGrid = ({ products = [] }: { products: any[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div className="p-4 text-center col-span-full">
        <p className="text-lg font-medium text-gray-500">Product display has been removed</p>
      </div>
    </div>
  );
};

export default ProductGrid;

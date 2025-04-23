
import React from 'react';

interface ProductDescriptionProps {
  description: string;
}

export const ProductDescription: React.FC<ProductDescriptionProps> = ({ description }) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Product Description</h2>
      <div className="prose max-w-none">
        <p>{description}</p>
      </div>
    </div>
  );
};

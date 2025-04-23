
import React from 'react';
import { Link } from 'react-router-dom';

interface ProductHeaderProps {
  title: string;
  category: string;
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({ title, category }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-primary">Products</Link>
        <span className="mx-2">/</span>
        <Link to={`/products?category=${encodeURIComponent(category)}`} className="hover:text-primary">
          {category}
        </Link>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
    </div>
  );
};

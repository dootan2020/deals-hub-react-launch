
import React from 'react';

interface CategoryHeaderProps {
  name: string;
  description?: string;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ name, description }) => {
  return (
    <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] py-12">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-2">{name}</h1>
        {description && (
          <p className="text-text-light">{description}</p>
        )}
      </div>
    </div>
  );
};

export default CategoryHeader;

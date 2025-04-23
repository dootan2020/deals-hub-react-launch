
import React from 'react';
import { Link } from 'react-router-dom';

const CategorySection: React.FC = () => {
  return (
    <section className="py-8 md:py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container-custom">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Browse Categories</h2>
          <p className="text-gray-600">Explore our range of digital products by category</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Placeholder categories */}
          {['Email Accounts', 'Social Media Accounts', 'Software Keys', 'Digital Services'].map((category, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg mb-2">{category}</h3>
              <p className="text-gray-500 text-sm mb-4">Browse our selection of {category.toLowerCase()}</p>
              <Link to={`/category/${index + 1}`} className="text-primary font-medium text-sm flex items-center">
                View Products
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link to="/products" className="inline-flex items-center text-accent hover:text-accent-dark font-medium">
            View All Categories
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;

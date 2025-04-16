
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import { getProductsByCategory, categories } from '@/data/mockData';
import { Product, Category } from '@/types';
import { Filter, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    if (categoryId) {
      // Find the category
      const foundCategory = categories.find(cat => cat.id === categoryId);
      setCategory(foundCategory);
      
      // Get products for this category
      const categoryProducts = getProductsByCategory(categoryId);
      setProducts(categoryProducts);
      setLoading(false);
    }
  }, [categoryId]);

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <div className="flex justify-center items-center h-64">
            <p>Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <div className="flex justify-center items-center h-64">
            <p>Category not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Category Header */}
      <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] py-12">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
          <p className="text-text-light">{category.description}</p>
        </div>
      </div>
      
      {/* Products Section */}
      <div className="container-custom py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
            >
              <div className="flex items-center">
                <SlidersHorizontal className="h-5 w-5 mr-2 text-text-light" />
                <span>Filters</span>
              </div>
              {showFilters ? (
                <ChevronUp className="h-5 w-5 text-text-light" />
              ) : (
                <ChevronDown className="h-5 w-5 text-text-light" />
              )}
            </button>
          </div>
          
          {/* Filters Sidebar */}
          <div 
            className={`md:w-1/4 lg:w-1/5 ${showFilters ? 'block' : 'hidden'} md:block`}
          >
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="font-semibold text-lg mb-4">Filters</h2>
              
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Price Range</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <span className="ml-2 text-text-light">Under $25</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <span className="ml-2 text-text-light">$25 - $50</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <span className="ml-2 text-text-light">$50 - $100</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <span className="ml-2 text-text-light">Over $100</span>
                  </label>
                </div>
              </div>
              
              {/* Rating */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Rating</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <span className="ml-2 text-text-light">4 Stars & Up</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <span className="ml-2 text-text-light">3 Stars & Up</span>
                  </label>
                </div>
              </div>
              
              {/* Availability */}
              <div>
                <h3 className="font-medium mb-2">Availability</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <span className="ml-2 text-text-light">In Stock</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="md:w-3/4 lg:w-4/5">
            {products.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-text-light">{products.length} products found</p>
                  <div className="flex items-center">
                    <span className="mr-2 text-text-light">Sort by:</span>
                    <select className="border border-gray-300 rounded p-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>Recommended</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Newest</option>
                      <option>Rating</option>
                    </select>
                  </div>
                </div>
                <ProductGrid products={products} />
              </>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-xl font-medium mb-2">No products found</p>
                <p className="text-text-light">
                  Try adjusting your filters or check back later for new products.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;

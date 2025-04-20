import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, X, ArrowRight } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from "@/integrations/supabase/client";
import { Product } from '@/types';
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { SearchProduct } from '@/types/search';

const popularSearches = [
  "Gmail Accounts",
  "Outlook Premium", 
  "Steam Games",
  "Office 365",
  "Discord Nitro",
  "VPN Software"
];

const SearchSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [productSuggestions, setProductSuggestions] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const debouncedSearchTerm = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchTerm.length < 3) {
        setProductSuggestions([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, title, price, slug, category_id, categories:category_id(name)")
          .ilike("title", `%${debouncedSearchTerm}%`)
          .limit(5);
          
        if (error) throw error;
        
        setProductSuggestions(data as SearchProduct[]);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const updatedRecentSearches = [
      searchQuery, 
      ...recentSearches.filter(item => item !== searchQuery)
    ].slice(0, 5);
    
    setRecentSearches(updatedRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecentSearches));
    
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(new Event('submit') as any);
  };

  const handleProductClick = (productSlug: string) => {
    navigate(`/products/${productSlug}`);
    setShowSuggestions(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <section className="bg-white py-12 border-b border-gray-200">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Tìm sản phẩm số phù hợp</h2>
            <p className="text-text-light">Tìm kiếm trong hàng nghìn sản phẩm số cho công việc trực tuyến của bạn</p>
          </div>

          <div ref={searchContainerRef} className="relative">
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Tìm tài khoản email, key phần mềm, tài khoản game..."
                  className="w-full px-6 py-4 pr-12 rounded-l-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <button 
                type="submit" 
                className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-r-lg transition-colors duration-200 flex items-center justify-center"
              >
                <Search className="h-5 w-5 mr-2" />
                Tìm kiếm
              </button>
            </form>

            {showSuggestions && (
              <div className="absolute z-40 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                {recentSearches.length > 0 && (
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-text-light">Tìm kiếm gần đây</h3>
                      <button 
                        onClick={clearRecentSearches}
                        className="text-xs text-accent hover:text-accent/80"
                      >
                        Xóa tất cả
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(search)}
                          className="py-1 px-3 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors duration-200"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchQuery.length >= 3 && (
                  <div className="max-h-64 overflow-y-auto">
                    <h3 className="px-4 py-2 text-sm font-medium text-text-light bg-gray-50">Gợi ý sản phẩm</h3>
                    
                    {isLoading && (
                      <div className="p-4 space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex justify-between items-center">
                            <div>
                              <Skeleton className="h-4 w-32 mb-1" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                            <Skeleton className="h-4 w-16" />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!isLoading && productSuggestions.length > 0 && productSuggestions.map(product => (
                      <div 
                        key={product.id}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                        onClick={() => handleProductClick(product.slug)}
                      >
                        <div>
                          <p className="font-medium">{product.title}</p>
                          <p className="text-sm text-text-light">
                            {product.categories?.name || 'Sản phẩm số'}
                          </p>
                        </div>
                        <span className="font-medium text-primary">{formatCurrency(product.price)}</span>
                      </div>
                    ))}
                    
                    {!isLoading && searchQuery.length >= 3 && productSuggestions.length > 0 && (
                      <div className="p-3 border-t border-gray-100 flex justify-center">
                        <button 
                          className="text-sm text-accent flex items-center hover:text-primary"
                          onClick={() => navigate(`/products?search=${encodeURIComponent(searchQuery)}`)}
                        >
                          Xem tất cả kết quả
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                    {!isLoading && searchQuery.length >= 3 && productSuggestions.length === 0 && (
                      <div className="px-4 py-8 text-center">
                        <p className="text-text-light mb-1">Không tìm thấy kết quả cho "{searchQuery}"</p>
                        <p className="text-sm">Thử từ khóa khác hoặc duyệt theo danh mục</p>
                      </div>
                    )}
                  </div>
                )}

                {(!searchQuery || searchQuery.length < 3) && (
                  <div className="p-3">
                    <div className="flex items-center gap-1 mb-2">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      <h3 className="text-sm font-medium text-text-light">Tìm kiếm phổ biến</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((term, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(term)}
                          className="py-1 px-3 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors duration-200"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <span className="text-sm text-text-light">Phổ biến:</span>
            <button 
              onClick={() => handleSuggestionClick('Gmail')} 
              className="text-sm text-accent hover:text-primary hover:underline"
            >
              Gmail
            </button>
            <span className="text-text-light">•</span>
            <button 
              onClick={() => handleSuggestionClick('Steam')} 
              className="text-sm text-accent hover:text-primary hover:underline"
            >
              Steam
            </button>
            <span className="text-text-light">•</span>
            <button 
              onClick={() => handleSuggestionClick('Microsoft Office')} 
              className="text-sm text-accent hover:text-primary hover:underline"
            >
              Microsoft Office
            </button>
            <span className="text-text-light">•</span>
            <button 
              onClick={() => handleSuggestionClick('VPN')} 
              className="text-sm text-accent hover:text-primary hover:underline"
            >
              VPN
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;

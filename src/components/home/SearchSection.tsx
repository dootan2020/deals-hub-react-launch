
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, X } from 'lucide-react';

const popularSearches = [
  "Gmail Accounts",
  "Outlook Premium",
  "Steam Games",
  "Office 365",
  "Discord Nitro",
  "VPN Software"
];

const productSuggestions = [
  { id: 1, name: "Gmail Account", category: "Email", price: 5.99 },
  { id: 2, name: "Spotify Premium", category: "Software", price: 9.99 },
  { id: 3, name: "Netflix Account", category: "Account", price: 14.99 },
  { id: 4, name: "Microsoft Office 2021", category: "Software", price: 49.99 },
  { id: 5, name: "Discord Nitro", category: "Software", price: 9.99 },
  { id: 6, name: "Steam Account", category: "Gaming", price: 12.99 },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

const SearchSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }

    // Click outside handler to close suggestions
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
    
    // Save to recent searches
    const updatedRecentSearches = [
      searchQuery, 
      ...recentSearches.filter(item => item !== searchQuery)
    ].slice(0, 5);
    
    setRecentSearches(updatedRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecentSearches));
    
    // Navigate to search results
    navigate(`/category/search?q=${encodeURIComponent(searchQuery)}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(new Event('submit') as any);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
    setShowSuggestions(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const filteredSuggestions = productSuggestions.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="bg-white py-12 border-b border-gray-200">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Find Your Perfect Digital Product</h2>
            <p className="text-text-light">Search through thousands of digital products for your online business</p>
          </div>

          <div ref={searchContainerRef} className="relative">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for email accounts, software keys, gaming accounts..."
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
                Search
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute z-40 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-text-light">Recent Searches</h3>
                      <button 
                        onClick={clearRecentSearches}
                        className="text-xs text-accent hover:text-accent/80"
                      >
                        Clear All
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

                {/* Product Suggestions - show when typing */}
                {searchQuery && filteredSuggestions.length > 0 && (
                  <div className="max-h-64 overflow-y-auto">
                    <h3 className="px-4 py-2 text-sm font-medium text-text-light bg-gray-50">Product Suggestions</h3>
                    {filteredSuggestions.map(product => (
                      <div 
                        key={product.id}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                        onClick={() => handleProductClick(product.id)}
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-text-light">{product.category}</p>
                        </div>
                        <span className="font-medium text-primary">{formatCurrency(product.price)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Popular Searches - show when empty */}
                {!searchQuery && (
                  <div className="p-3">
                    <div className="flex items-center gap-1 mb-2">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      <h3 className="text-sm font-medium text-text-light">Popular Searches</h3>
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
                
                {searchQuery && filteredSuggestions.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-text-light mb-1">No suggestions found for "{searchQuery}"</p>
                    <p className="text-sm">Try a different search term or browse categories</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Tags */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <span className="text-sm text-text-light">Popular:</span>
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

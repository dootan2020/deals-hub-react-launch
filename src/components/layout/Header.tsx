
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">
              Digital<span className="text-accent">Deals</span>Hub
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-text hover:text-primary transition-colors duration-200">
              Home
            </Link>
            <Link to="/category/email" className="text-text hover:text-primary transition-colors duration-200">
              Email Accounts
            </Link>
            <Link to="/category/account" className="text-text hover:text-primary transition-colors duration-200">
              Gaming Accounts
            </Link>
            <Link to="/category/other" className="text-text hover:text-primary transition-colors duration-200">
              Software Keys
            </Link>
          </nav>

          {/* Search Bar - Desktop Only */}
          <div className="hidden lg:flex relative">
            <input
              type="text"
              placeholder="Search products..."
              className="border border-gray-200 rounded-md pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-primary"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="hidden md:flex items-center">
              <Globe className="h-5 w-5 text-text-light" />
              <select className="ml-1 text-sm text-text-light bg-transparent border-none focus:outline-none">
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="pt">PT</option>
              </select>
            </div>

            {/* User Icon */}
            <button className="p-1 text-text-light hover:text-primary transition-colors">
              <User className="h-6 w-6" />
            </button>

            {/* Cart Icon */}
            <Link to="/cart" className="p-1 text-text-light hover:text-primary transition-colors relative">
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-1 text-text-light hover:text-primary"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search - Visible on All Mobile Screens */}
        <div className="mt-4 relative lg:hidden">
          <input
            type="text"
            placeholder="Search products..."
            className="border border-gray-200 rounded-md pl-10 pr-4 py-2 w-full focus:outline-none focus:border-primary"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-200",
            mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={toggleMobileMenu}
        >
          <div
            className={cn(
              "fixed top-0 right-0 bottom-0 w-64 bg-white p-6 shadow-xl transition-transform duration-300 z-50",
              mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary">Menu</h2>
              <button onClick={toggleMobileMenu}>
                <X className="h-6 w-6 text-text-light" />
              </button>
            </div>
            
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-text hover:text-primary transition-colors duration-200"
                onClick={toggleMobileMenu}
              >
                Home
              </Link>
              <Link 
                to="/category/email" 
                className="text-text hover:text-primary transition-colors duration-200"
                onClick={toggleMobileMenu}
              >
                Email Accounts
              </Link>
              <Link 
                to="/category/account" 
                className="text-text hover:text-primary transition-colors duration-200"
                onClick={toggleMobileMenu}
              >
                Gaming Accounts
              </Link>
              <Link 
                to="/category/other" 
                className="text-text hover:text-primary transition-colors duration-200"
                onClick={toggleMobileMenu}
              >
                Software Keys
              </Link>

              {/* Language Selector for Mobile */}
              <div className="flex items-center pt-4 border-t border-gray-200 mt-4">
                <Globe className="h-5 w-5 text-text-light" />
                <select className="ml-2 text-sm text-text-light bg-transparent border-none focus:outline-none">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

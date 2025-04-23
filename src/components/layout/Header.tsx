
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, ShoppingCart, Search, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserButton } from './header/UserButton';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAdmin } = useAuth();
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary flex items-center">
            AccZen.net
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-text hover:text-primary font-medium">
              Trang chủ
            </Link>
            <Link to="/products" className="text-text hover:text-primary font-medium">
              Sản phẩm
            </Link>
            <Link to="#" className="text-text hover:text-primary font-medium">
              Giới thiệu
            </Link>
            <Link to="#" className="text-text hover:text-primary font-medium">
              Liên hệ
            </Link>
            
            {/* Admin Menu - Only shown for admin users */}
            {isAdmin && (
              <Link 
                to="/admin" 
                className="text-primary hover:text-primary-dark font-medium flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Quản trị
              </Link>
            )}
          </nav>
          
          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link to="/search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
            
            <UserButton />
          </div>
          
          {/* Mobile menu button */}
          <button
            className="md:hidden flex items-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-text" />
            ) : (
              <Menu className="h-6 w-6 text-text" />
            )}
          </button>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t mt-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-text hover:text-primary font-medium px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Trang chủ
              </Link>
              <Link 
                to="/products" 
                className="text-text hover:text-primary font-medium px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sản phẩm
              </Link>
              <Link 
                to="#" 
                className="text-text hover:text-primary font-medium px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Giới thiệu
              </Link>
              <Link 
                to="#" 
                className="text-text hover:text-primary font-medium px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Liên hệ
              </Link>
              
              {/* Admin Menu in mobile - Only shown for admin users */}
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="text-primary hover:text-primary-dark font-medium px-2 py-1 flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Quản trị
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

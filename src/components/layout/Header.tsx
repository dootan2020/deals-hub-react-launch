
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './header/Logo';
import MobileMenuToggle from './header/MobileMenuToggle';
import MobileNavigation from './header/MobileNavigation';
import UserButton from './header/UserButton';
import DepositOptions from './header/DepositOptions';
import LanguageSelector from './header/LanguageSelector';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Left section - Logo */}
          <div className="flex items-center">
            <Logo />
          </div>
          
          {/* Center section - Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-primary transition-colors">
              Sản phẩm
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-primary transition-colors">
              Giới thiệu
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary transition-colors">
              Liên hệ
            </Link>
          </nav>
          
          {/* Right section - User related */}
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            
            {!loading && (
              <>
                {isAuthenticated ? (
                  <>
                    <DepositOptions />
                    <UserButton />
                  </>
                ) : (
                  <div className="hidden md:flex items-center space-x-4">
                    <Link to="/login" className="text-gray-700 hover:text-primary transition-colors font-medium">
                      Đăng nhập
                    </Link>
                    <Link to="/register" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors">
                      Đăng ký
                    </Link>
                  </div>
                )}
              </>
            )}
            
            <MobileMenuToggle isOpen={mobileMenuOpen} onClick={toggleMobileMenu} />
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <MobileNavigation isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
};

export default Header;

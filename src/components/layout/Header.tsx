
import { useState } from 'react';
import Logo from './header/Logo';
import DesktopNavigation from './header/DesktopNavigation';
import LanguageSelector from './header/LanguageSelector';
import UserButton from './header/UserButton';
import CartButton from './header/CartButton';
import MobileMenuToggle from './header/MobileMenuToggle';
import MobileNavigation from './header/MobileNavigation';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Email accounts subcategories
  const emailCategories = [
    { name: "Gmail Accounts", path: "/category/gmail" },
    { name: "Outlook Accounts", path: "/category/outlook" },
    { name: "Yahoo Accounts", path: "/category/yahoo" },
    { name: "Corporate Emails", path: "/category/corporate-email" }
  ];

  // Software key subcategories
  const softwareCategories = [
    { name: "Windows Keys", path: "/category/windows" },
    { name: "Office Keys", path: "/category/office" },
    { name: "Antivirus Software", path: "/category/antivirus" },
    { name: "Adobe Products", path: "/category/adobe" }
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <DesktopNavigation 
            emailCategories={emailCategories} 
            softwareCategories={softwareCategories} 
          />

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <LanguageSelector />

            {/* User Icon */}
            <UserButton />

            {/* Cart Icon */}
            <CartButton cartItemsCount={cartItemsCount} />

            {/* Mobile Menu Toggle */}
            <MobileMenuToggle 
              isOpen={mobileMenuOpen} 
              toggleMenu={toggleMobileMenu} 
            />
          </div>

          {/* Mobile Menu */}
          <MobileNavigation 
            isOpen={mobileMenuOpen}
            toggleMenu={toggleMobileMenu}
            emailCategories={emailCategories}
            softwareCategories={softwareCategories}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;

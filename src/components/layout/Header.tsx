
import { useState } from 'react';
import Logo from './header/Logo';
import DesktopNavigation from './header/DesktopNavigation';
import LanguageSelector from './header/LanguageSelector';
import { UserButton } from './header/UserButton';
import MobileMenuToggle from './header/MobileMenuToggle';
import MobileNavigation from './header/MobileNavigation';
import { DepositOptions } from './header/DepositOptions';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <Logo />
          <DesktopNavigation />
          
          <div className="flex items-center space-x-4">
            <DepositOptions />
            <LanguageSelector />
            <UserButton />
            <MobileMenuToggle 
              isOpen={mobileMenuOpen} 
              toggleMenu={toggleMobileMenu} 
            />
          </div>

          <MobileNavigation 
            isOpen={mobileMenuOpen}
            toggleMenu={toggleMobileMenu}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;

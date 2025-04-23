
import { useState } from 'react';
import Logo from './header/Logo';
// import DesktopNavigation from './header/DesktopNavigation';
// import LanguageSelector from './header/LanguageSelector';
// import { UserButton } from './header/UserButton';
// import MobileMenuToggle from './header/MobileMenuToggle';
// import MobileNavigation from './header/MobileNavigation';
// import { DepositOptions } from './header/DepositOptions';
// import { RealtimeNotifier } from './header/RealtimeNotifier';

const Header = () => {
  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // const toggleMobileMenu = () => {
  //   setMobileMenuOpen(!mobileMenuOpen);
  // };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* <RealtimeNotifier /> */}
      <div className="container-custom py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          {/* <DesktopNavigation /> */}
          {/* <div className="flex items-center gap-2 md:gap-4">
            <DepositOptions />
            <div className="flex items-center gap-2 md:gap-3">
              <LanguageSelector />
              <UserButton />
            </div>
            <MobileMenuToggle 
              isOpen={mobileMenuOpen} 
              toggleMenu={toggleMobileMenu} 
            />
          </div>
          <MobileNavigation 
            isOpen={mobileMenuOpen}
            toggleMenu={toggleMobileMenu}
          /> */}
        </div>
      </div>
    </header>
  );
};

export default Header;

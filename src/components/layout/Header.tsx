
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

// Simple logo component
const Logo = () => (
  <Link to="/" className="text-xl font-bold text-primary flex items-center">
    Digital Deals Hub
  </Link>
);

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto py-3 md:py-4 px-4">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/products">
              <Button variant="ghost">Products</Button>
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/account">
                  <Button variant="outline">My Account</Button>
                </Link>
                <Button variant="ghost" onClick={() => logout()}>Logout</Button>
              </div>
            ) : (
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag } from 'lucide-react';

export const DesktopNavigation = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <nav className="hidden md:flex items-center gap-6">
      <Link
        to="/"
        className={cn('text-sm font-medium transition-colors hover:text-primary', {
          'text-primary': location.pathname === '/',
        })}
      >
        Home
      </Link>
      <Link
        to="/products"
        className={cn('text-sm font-medium transition-colors hover:text-primary', {
          'text-primary': location.pathname.startsWith('/products') || location.pathname.startsWith('/product/'),
        })}
      >
        Products
      </Link>
      <Link
        to="/support"
        className={cn('text-sm font-medium transition-colors hover:text-primary', {
          'text-primary': location.pathname.startsWith('/support'),
        })}
      >
        Support
      </Link>
      <Link
        to="/orders"
        className={cn('text-sm font-medium transition-colors hover:text-primary', {
          'text-primary': location.pathname.startsWith('/orders'),
        })}
      >
        <ShoppingBag className="w-4 h-4 inline mr-1" />
        Orders
      </Link>
    </nav>
  );
};

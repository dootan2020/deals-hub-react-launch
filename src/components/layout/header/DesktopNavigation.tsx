
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';
import CategoryDropdown from '@/components/navigation/CategoryDropdown';

export const DesktopNavigation = () => {
  const location = useLocation();
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  return (
    <nav className="hidden md:flex items-center gap-6">
      <Link
        to="/"
        className={cn('text-sm font-medium transition-colors hover:text-primary', {
          'text-primary': location.pathname === '/',
        })}
      >
        Trang chủ
      </Link>
      
      <div className="relative">
        <button
          onMouseEnter={() => setIsCategoryDropdownOpen(true)}
          onMouseLeave={() => setIsCategoryDropdownOpen(false)}
          className={cn('text-sm font-medium transition-colors hover:text-primary', {
            'text-primary': location.pathname.startsWith('/categories'),
          })}
        >
          Danh mục
        </button>
        
        <div
          onMouseEnter={() => setIsCategoryDropdownOpen(true)}
          onMouseLeave={() => setIsCategoryDropdownOpen(false)}
        >
          <CategoryDropdown isOpen={isCategoryDropdownOpen} />
        </div>
      </div>

      <Link
        to="/support"
        className={cn('text-sm font-medium transition-colors hover:text-primary', {
          'text-primary': location.pathname.startsWith('/support'),
        })}
      >
        Hỗ trợ
      </Link>
      
      <Link
        to="/orders"
        className={cn('text-sm font-medium transition-colors hover:text-primary', {
          'text-primary': location.pathname.startsWith('/orders'),
        })}
      >
        <ShoppingBag className="w-4 h-4 inline mr-1" />
        Đơn hàng
      </Link>
    </nav>
  );
};

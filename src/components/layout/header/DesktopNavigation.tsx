
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';
import CategoryDropdown from '@/components/navigation/CategoryDropdown';
import { useCategoriesContext } from '@/context/CategoriesContext';

export const DesktopNavigation = () => {
  const location = useLocation();
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const { mainCategories, getSubcategoriesByParentId } = useCategoriesContext();

  return (
    <nav className="hidden md:flex items-center justify-center gap-6">
      <Link
        to="/"
        className={cn('text-sm font-medium transition-colors hover:text-primary', {
          'text-primary': location.pathname === '/',
        })}
      >
        Trang chủ
      </Link>
      
      <div 
        className="relative"
        onMouseEnter={() => setIsCategoryDropdownOpen(true)}
        onMouseLeave={() => setIsCategoryDropdownOpen(false)}
      >
        <button
          className={cn('text-sm font-medium transition-colors hover:text-primary', {
            'text-primary': location.pathname.startsWith('/categories'),
          })}
        >
          Danh mục
        </button>
        
        <CategoryDropdown 
          isOpen={isCategoryDropdownOpen} 
          mainCategories={mainCategories}
          getSubcategoriesByParentId={getSubcategoriesByParentId}
        />
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

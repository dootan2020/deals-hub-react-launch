
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag } from 'lucide-react';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { useCategoriesContext } from '@/context/CategoriesContext';

export const DesktopNavigation = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { mainCategories, getSubcategoriesByParentId } = useCategoriesContext();

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
      
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Danh mục</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {mainCategories.map((category) => {
                  const subcategories = getSubcategoriesByParentId(category.id);
                  return (
                    <li key={category.id} className="row-span-3">
                      <Link
                        to={`/categories/${category.slug}`}
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">{category.name}</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          {category.description}
                        </p>
                      </Link>
                      {subcategories.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {subcategories.map((subcategory) => (
                            <li key={subcategory.id}>
                              <Link
                                to={`/categories/${category.slug}/${subcategory.slug}`}
                                className="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                              >
                                {subcategory.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

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

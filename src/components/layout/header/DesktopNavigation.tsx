
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useCategoriesContext } from '@/context/CategoriesContext';

export function DesktopNavigation() {
  const { categories, loading } = useCategoriesContext();
  
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link to="/" className="text-base text-gray-700 hover:text-primary px-2 py-1">
            Home
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <Link to="/products" className="text-base text-gray-700 hover:text-primary px-2 py-1">
            Products
          </Link>
        </NavigationMenuItem>
        
        {categories.length > 0 && (
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent hover:bg-transparent text-base text-gray-700 hover:text-primary font-normal">
              Categories
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px] grid-cols-2">
                {categories.map((category) => (
                  <li key={category.id} className="row-span-1">
                    <NavigationMenuLink asChild>
                      <Link
                        to={`/products?category=${category.slug}`}
                        className="flex h-full w-full select-none flex-col justify-between rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none hover:bg-gradient-to-b hover:from-muted hover:to-muted focus:shadow-md"
                      >
                        <div className="mb-2 mt-4 font-medium">
                          {category.name}
                        </div>
                        <div className="text-sm leading-tight text-muted-foreground">
                          {category.count || 0} products
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}
        
        <NavigationMenuItem>
          <Link to="/support" className="text-base text-gray-700 hover:text-primary px-2 py-1">
            Support
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Home, LayoutGrid, Contact, ShoppingCart, Menu, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/context/AuthContext';
import { useCategoriesContext } from '@/context/CategoriesContext';

interface MobileNavigationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNavigation({ isOpen, onOpenChange }: MobileNavigationProps) {
  const { isAuthenticated, logout } = useAuth();
  const { categories } = useCategoriesContext();
  const navigate = useNavigate();
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    if (openCategory === categoryId) {
      setOpenCategory(null);
    } else {
      setOpenCategory(categoryId);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  const handleLogout = async () => {
    await logout();
    onOpenChange(false);
    navigate('/login');
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[85vw] sm:w-[350px] p-0">
        <ScrollArea className="h-full py-6">
          <div className="px-6 py-2 border-b">
            <div className="font-semibold text-lg mb-1">Menu</div>
            <div className="text-sm text-muted-foreground">
              Browse our products and services
            </div>
          </div>
          
          <div className="px-2 py-4 space-y-1">
            {/* Main Navigation */}
            <Button 
              variant="ghost" 
              className="w-full justify-start text-base font-normal h-12"
              onClick={() => handleNavigate('/')}
            >
              <Home className="h-5 w-5 mr-2" />
              Home
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-base font-normal h-12"
              onClick={() => handleNavigate('/products')}
            >
              <LayoutGrid className="h-5 w-5 mr-2" />
              All Products
            </Button>
            
            {/* Categories */}
            <div className="py-1">
              <div className="px-4 pb-1 pt-3 text-sm font-medium text-muted-foreground">
                Categories
              </div>
              
              {categories.map((category) => (
                <Collapsible
                  key={category.id}
                  open={openCategory === category.id}
                  onOpenChange={() => toggleCategory(category.id)}
                  className="w-full"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-base font-normal h-12"
                    >
                      <span className="flex items-center">
                        <span>{category.name}</span>
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openCategory === category.id ? 'transform rotate-180' : ''
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-base font-normal h-12"
                      onClick={() => handleNavigate(`/products?category=${category.slug}`)}
                    >
                      <ChevronRight className="h-4 w-4 mr-2" />
                      All {category.name}
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-base font-normal h-12"
              onClick={() => handleNavigate('/support')}
            >
              <Contact className="h-5 w-5 mr-2" />
              Support
            </Button>
            
            {/* Account links */}
            <div className="py-1 mt-4 border-t pt-4">
              <div className="px-4 pb-1 text-sm font-medium text-muted-foreground">
                Account
              </div>
              
              {isAuthenticated ? (
                <>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-base font-normal h-12"
                    onClick={() => handleNavigate('/dashboard')}
                  >
                    Dashboard
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-base font-normal h-12"
                    onClick={() => handleNavigate('/account')}
                  >
                    My Account
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-base font-normal h-12 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-base font-normal h-12"
                    onClick={() => handleNavigate('/login')}
                  >
                    Login
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-base font-normal h-12"
                    onClick={() => handleNavigate('/register')}
                  >
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export function MobileMenuToggle({ onToggle }: { onToggle: () => void }) {
  return (
    <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggle}>
      <Menu className="h-6 w-6" />
    </Button>
  );
}

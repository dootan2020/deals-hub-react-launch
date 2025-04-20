
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ShoppingBag } from 'lucide-react';

interface MobileNavLinkProps {
  to: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const MobileNavLink = ({ to, onClick, children }: MobileNavLinkProps) => {
  return (
    <Link 
      to={to} 
      className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

interface MobileNavigationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileNavigation = ({ isOpen, onOpenChange }: MobileNavigationProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[240px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Browse our site</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-3 mt-6">
          <MobileNavLink to="/" onClick={() => onOpenChange(false)}>
            Home
          </MobileNavLink>
          <MobileNavLink to="/products" onClick={() => onOpenChange(false)}>
            Products
          </MobileNavLink>
          <MobileNavLink to="/support" onClick={() => onOpenChange(false)}>
            Support
          </MobileNavLink>
          <MobileNavLink to="/orders" onClick={() => onOpenChange(false)}>
            <ShoppingBag className="w-4 h-4 mr-2" />
            Orders
          </MobileNavLink>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

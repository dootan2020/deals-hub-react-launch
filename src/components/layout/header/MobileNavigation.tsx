import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { MobileNavLink } from './MobileNavLink';
import { MobileNavigationProps } from '@/types/layout';
import { ShoppingBag } from 'lucide-react';

export const MobileNavigation = ({ isOpen, onClose }: MobileNavigationProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[240px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Browse our site</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-3 mt-6">
          <MobileNavLink to="/" onClick={onClose}>
            Home
          </MobileNavLink>
          <MobileNavLink to="/products" onClick={onClose}>
            Products
          </MobileNavLink>
          <MobileNavLink to="/faq" onClick={onClose}>
            FAQ
          </MobileNavLink>
          <MobileNavLink to="/support" onClick={onClose}>
            Support
          </MobileNavLink>
          <MobileNavLink to="/orders" onClick={onClose}>
            <ShoppingBag className="w-4 h-4 mr-2" />
            Orders
          </MobileNavLink>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

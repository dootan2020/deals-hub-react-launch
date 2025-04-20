
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useCategoriesContext } from '@/context/CategoriesContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MobileNavigationProps } from '@/types/layout';

export const MobileNavigation = ({ isOpen, onOpenChange }: MobileNavigationProps) => {
  const { mainCategories, getSubcategoriesByParentId } = useCategoriesContext();
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Danh mục sản phẩm</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="flex flex-col p-2">
            <Link to="/" onClick={() => onOpenChange(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Trang chủ
              </Button>
            </Link>
            
            <Accordion type="single" collapsible className="w-full">
              {mainCategories.map((category) => {
                const subcategories = getSubcategoriesByParentId(category.id);
                return (
                  <AccordionItem value={category.id} key={category.id}>
                    <AccordionTrigger className="py-2 px-4 hover:no-underline">
                      {category.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col space-y-1">
                        <Link
                          to={`/categories/${category.slug}`}
                          onClick={() => onOpenChange(false)}
                          className="py-2 px-4 text-sm hover:bg-accent rounded-md flex items-center"
                        >
                          Tất cả {category.name}
                          <ChevronRight className="ml-auto h-4 w-4" />
                        </Link>
                        {subcategories.map((subcategory) => (
                          <Link
                            key={subcategory.id}
                            to={`/categories/${category.slug}/${subcategory.slug}`}
                            onClick={() => onOpenChange(false)}
                            className="py-2 px-4 text-sm hover:bg-accent rounded-md flex items-center"
                          >
                            {subcategory.name}
                            <ChevronRight className="ml-auto h-4 w-4" />
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            <Link to="/support" onClick={() => onOpenChange(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Hỗ trợ
              </Button>
            </Link>
            
            <Link to="/orders" onClick={() => onOpenChange(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Đơn hàng
              </Button>
            </Link>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

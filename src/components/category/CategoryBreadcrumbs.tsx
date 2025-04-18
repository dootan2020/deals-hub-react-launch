
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Category } from '@/types';

interface CategoryBreadcrumbsProps {
  breadcrumbs: Category[];
  showAllProducts?: boolean;
}

const CategoryBreadcrumbs: React.FC<CategoryBreadcrumbsProps> = ({ breadcrumbs, showAllProducts }) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        
        <BreadcrumbSeparator />
        
        {showAllProducts ? (
          <BreadcrumbItem>
            <BreadcrumbPage>All Products</BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink href="/products">Products</BreadcrumbLink>
            </BreadcrumbItem>
        
            {breadcrumbs.map((category, index) => {
              const isLastItem = index === breadcrumbs.length - 1;
              
              return (
                <React.Fragment key={category.id}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLastItem ? (
                      <BreadcrumbPage>{category.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={`/category/${category.slug}`}>
                        {category.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default CategoryBreadcrumbs;

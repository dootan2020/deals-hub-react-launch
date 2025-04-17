
import React from 'react';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator,
  BreadcrumbPage 
} from '@/components/ui/breadcrumb';

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface CategoryBreadcrumbsProps {
  breadcrumbs: BreadcrumbItem[];
}

const CategoryBreadcrumbs: React.FC<CategoryBreadcrumbsProps> = ({ breadcrumbs }) => {
  return (
    <div className="bg-white border-b">
      <div className="container-custom py-3">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              
              return (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{breadcrumb.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={breadcrumb.path}>
                        {breadcrumb.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export default CategoryBreadcrumbs;

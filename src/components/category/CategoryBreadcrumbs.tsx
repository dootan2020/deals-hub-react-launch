
import React from 'react';
import { Link } from 'react-router-dom';
import { CategoryWithParent } from '@/types/category.types';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage,
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';

interface CategoryBreadcrumbsProps {
  categories: CategoryWithParent[];
}

const CategoryBreadcrumbs: React.FC<CategoryBreadcrumbsProps> = ({ categories }) => {
  return (
    <div className="bg-white border-b">
      <div className="container-custom py-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {categories.map((cat, index) => (
              <React.Fragment key={cat.id}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {index === categories.length - 1 ? (
                    <BreadcrumbPage>{cat.name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={cat.parent ? `/${cat.parent.slug}/${cat.slug}` : `/category/${cat.slug}`}>
                        {cat.name}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export default CategoryBreadcrumbs;

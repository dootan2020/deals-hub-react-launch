
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Link } from 'react-router-dom';
import { Category } from '@/types';

interface ProductHeaderProps {
  title: string;
  category?: {
    parent?: Category | null;
    name?: string;
    slug?: string;
  } | null;
}

export const ProductHeader = ({ title, category }: ProductHeaderProps) => {
  return (
    <>
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          
          {category && (
            <>
              {category.parent && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/category/${category.parent.slug}`}>
                        {category.parent.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/category/${category.slug}`}>
                    {category.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        {title}
      </h1>
    </>
  );
};

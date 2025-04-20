
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger
} from '@/components/ui/navigation-menu';
import { useCategoriesContext } from '@/context/CategoriesContext';
import { Category } from '@/types';

const DesktopNavigation = () => {
  const { mainCategories, getSubcategoriesByParentId, isLoading } = useCategoriesContext();
  
  if (isLoading) {
    return (
      <div className="hidden md:flex items-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
        <span className="text-sm">Loading menu...</span>
      </div>
    );
  }

  const getCategoryUrl = (category: Category) => {
    return `/category/${category.slug}`;
  };

  return (
    <div className="hidden md:block">
      <NavigationMenu>
        <NavigationMenuList className="space-x-1">
          {mainCategories.map((category) => {
            const subcategories = getSubcategoriesByParentId(category.id);
            
            return (
              <NavigationMenuItem key={category.id} className="relative">
                <NavigationMenuTrigger 
                  className="bg-transparent hover:bg-accent/10 hover:text-primary transition-all duration-150 focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-primary"
                >
                  {category.name}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="mt-0">
                  <ul className="grid w-[400px] gap-1 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {subcategories.length > 0 ? (
                      subcategories.map((subcategory) => (
                        <li key={subcategory.id}>
                          <Link
                            to={getCategoryUrl(subcategory)}
                            className="block select-none rounded-md px-4 py-2 text-sm font-medium no-underline transition-colors hover:bg-accent/10 hover:text-primary focus:bg-accent focus:text-accent-foreground"
                          >
                            {subcategory.name}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-sm text-muted-foreground">
                        No subcategories found
                      </li>
                    )}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          })}
          
          <NavigationMenuItem>
            <Link 
              to="/support" 
              className="text-text hover:text-primary transition-all duration-150 px-4 py-2 text-sm font-medium rounded-md hover:bg-accent/10"
            >
              Support
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link 
              to="/faqs" 
              className="text-text hover:text-primary transition-all duration-150 px-4 py-2 text-sm font-medium rounded-md hover:bg-accent/10"
            >
              FAQs
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default DesktopNavigation;

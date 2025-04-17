
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

  // Generate category menu URLs
  const getCategoryUrl = (category: Category) => {
    return `/category/${category.slug}`;
  };

  return (
    <div className="hidden md:block">
      <NavigationMenu>
        <NavigationMenuList>
          {/* Map through main categories from the database */}
          {mainCategories.map((category) => {
            const subcategories = getSubcategoriesByParentId(category.id);
            
            return (
              <NavigationMenuItem key={category.id}>
                <NavigationMenuTrigger className="bg-transparent hover:text-primary focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-primary">
                  {category.name}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="mt-0">
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {subcategories.length > 0 ? (
                      subcategories.map((subcategory) => (
                        <li key={subcategory.id}>
                          <Link
                            to={getCategoryUrl(subcategory)}
                            className="block select-none space-y-1 rounded-md p-3 text-sm font-medium leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            {subcategory.name}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="p-3 text-sm text-muted-foreground">
                        No subcategories found
                      </li>
                    )}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          })}
          
          {/* Static menu items that don't change */}
          <NavigationMenuItem>
            <Link to="/support" className="text-text hover:text-primary transition-colors duration-200 px-3 py-2 text-sm font-medium">
              Support
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link to="/faqs" className="text-text hover:text-primary transition-colors duration-200 px-3 py-2 text-sm font-medium">
              FAQs
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link to="/deposit" className="text-text hover:text-primary transition-colors duration-200 px-3 py-2 text-sm font-medium">
              Deposit
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default DesktopNavigation;

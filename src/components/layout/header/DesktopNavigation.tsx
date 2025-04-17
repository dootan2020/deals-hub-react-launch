
import { Link } from 'react-router-dom';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger
} from '@/components/ui/navigation-menu';

interface Category {
  name: string;
  path: string;
}

interface DesktopNavigationProps {
  emailCategories: Category[];
  softwareCategories: Category[];
}

const DesktopNavigation = ({ emailCategories, softwareCategories }: DesktopNavigationProps) => {
  return (
    <div className="hidden md:block">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent hover:text-primary focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-primary">
              Email Accounts
            </NavigationMenuTrigger>
            <NavigationMenuContent className="mt-0">
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {emailCategories.map((category) => (
                  <li key={category.path}>
                    <Link
                      to={category.path}
                      className="block select-none space-y-1 rounded-md p-3 text-sm font-medium leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent hover:text-primary focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-primary">
              Software Keys
            </NavigationMenuTrigger>
            <NavigationMenuContent className="mt-0">
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {softwareCategories.map((category) => (
                  <li key={category.path}>
                    <Link
                      to={category.path}
                      className="block select-none space-y-1 rounded-md p-3 text-sm font-medium leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          
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

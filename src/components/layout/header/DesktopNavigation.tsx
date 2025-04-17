
import { Link } from 'react-router-dom';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
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
            <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
              Email Accounts
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {emailCategories.map((category) => (
                  <li key={category.path}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={category.path}
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">{category.name}</div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
              Software Keys
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {softwareCategories.map((category) => (
                  <li key={category.path}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={category.path}
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">{category.name}</div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link to="/support" className="text-text hover:text-primary transition-colors duration-200 px-3 py-2">
              Support
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link to="/faqs" className="text-text hover:text-primary transition-colors duration-200 px-3 py-2">
              FAQs
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link to="/deposit" className="text-text hover:text-primary transition-colors duration-200 px-3 py-2">
              Deposit
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default DesktopNavigation;

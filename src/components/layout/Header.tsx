
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Globe, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from '@/components/ui/navigation-menu';
import { toast } from '@/components/ui/sonner';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Email accounts subcategories
  const emailCategories = [
    { name: "Gmail Accounts", path: "/category/gmail" },
    { name: "Outlook Accounts", path: "/category/outlook" },
    { name: "Yahoo Accounts", path: "/category/yahoo" },
    { name: "Corporate Emails", path: "/category/corporate-email" }
  ];

  // Software key subcategories
  const softwareCategories = [
    { name: "Windows Keys", path: "/category/windows" },
    { name: "Office Keys", path: "/category/office" },
    { name: "Antivirus Software", path: "/category/antivirus" },
    { name: "Adobe Products", path: "/category/adobe" }
  ];

  const handleAddToCart = () => {
    toast.success("Added to cart!");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Now main navigation to home */}
          <Link to="/" className="flex items-center" aria-label="Home">
            <h1 className="text-2xl font-bold text-primary">
              Digital<span className="text-accent">Deals</span>Hub
            </h1>
          </Link>

          {/* Desktop Navigation using NavigationMenu */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Home link removed - Logo now serves as home link */}

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

                {/* Gaming Accounts menu removed */}

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

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="hidden md:flex items-center">
              <Globe className="h-5 w-5 text-text-light" />
              <select className="ml-1 text-sm text-text-light bg-transparent border-none focus:outline-none">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>

            {/* User Icon */}
            <button className="p-1 text-text-light hover:text-primary transition-colors">
              <User className="h-6 w-6" />
            </button>

            {/* Cart Icon */}
            <button 
              onClick={handleAddToCart} 
              className="p-1 text-text-light hover:text-primary transition-colors relative"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-1 text-text-light hover:text-primary"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={cn(
              "fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-200",
              mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={toggleMobileMenu}
          >
            <div
              className={cn(
                "fixed top-0 right-0 bottom-0 w-64 bg-white p-6 shadow-xl transition-transform duration-300 z-50",
                mobileMenuOpen ? "translate-x-0" : "translate-x-full"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-primary">Menu</h2>
                <button onClick={toggleMobileMenu}>
                  <X className="h-6 w-6 text-text-light" />
                </button>
              </div>
              
              <nav className="flex flex-col space-y-4">
                {/* Home link removed from mobile menu */}

                {/* Email Accounts Dropdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between cursor-pointer text-text hover:text-primary transition-colors duration-200">
                    <span>Email Accounts</span>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                  <div className="pl-4 space-y-2">
                    {emailCategories.map((category) => (
                      <Link 
                        key={category.path}
                        to={category.path} 
                        className="block text-text-light hover:text-primary transition-colors duration-200"
                        onClick={toggleMobileMenu}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Gaming Accounts Dropdown removed from mobile menu */}

                {/* Software Keys Dropdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between cursor-pointer text-text hover:text-primary transition-colors duration-200">
                    <span>Software Keys</span>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                  <div className="pl-4 space-y-2">
                    {softwareCategories.map((category) => (
                      <Link 
                        key={category.path}
                        to={category.path} 
                        className="block text-text-light hover:text-primary transition-colors duration-200"
                        onClick={toggleMobileMenu}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
                
                <Link 
                  to="/support" 
                  className="text-text hover:text-primary transition-colors duration-200"
                  onClick={toggleMobileMenu}
                >
                  Support
                </Link>
                
                <Link 
                  to="/faqs" 
                  className="text-text hover:text-primary transition-colors duration-200"
                  onClick={toggleMobileMenu}
                >
                  FAQs
                </Link>
                
                <Link 
                  to="/deposit" 
                  className="text-text hover:text-primary transition-colors duration-200"
                  onClick={toggleMobileMenu}
                >
                  Deposit
                </Link>

                {/* Language Selector for Mobile */}
                <div className="flex items-center pt-4 border-t border-gray-200 mt-4">
                  <Globe className="h-5 w-5 text-text-light" />
                  <select className="ml-2 text-sm text-text-light bg-transparent border-none focus:outline-none">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="pt">Portuguese</option>
                  </select>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

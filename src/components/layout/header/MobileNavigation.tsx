
import { Link } from 'react-router-dom';
import { ChevronDown, Globe, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  name: string;
  path: string;
}

interface MobileNavigationProps {
  isOpen: boolean;
  toggleMenu: () => void;
  emailCategories: Category[];
  softwareCategories: Category[];
}

const MobileNavigation = ({ 
  isOpen, 
  toggleMenu, 
  emailCategories, 
  softwareCategories 
}: MobileNavigationProps) => {
  return (
    <div
      className={cn(
        "fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-200",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={toggleMenu}
    >
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 w-64 bg-white p-6 shadow-xl transition-transform duration-300 z-50",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary">Menu</h2>
          <button onClick={toggleMenu}>
            <X className="h-6 w-6 text-text-light" />
          </button>
        </div>
        
        <nav className="flex flex-col space-y-4">
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
                  onClick={toggleMenu}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

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
                  onClick={toggleMenu}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
          
          <Link 
            to="/support" 
            className="text-text hover:text-primary transition-colors duration-200"
            onClick={toggleMenu}
          >
            Support
          </Link>
          
          <Link 
            to="/faqs" 
            className="text-text hover:text-primary transition-colors duration-200"
            onClick={toggleMenu}
          >
            FAQs
          </Link>
          
          <Link 
            to="/deposit" 
            className="text-text hover:text-primary transition-colors duration-200"
            onClick={toggleMenu}
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
  );
};

export default MobileNavigation;

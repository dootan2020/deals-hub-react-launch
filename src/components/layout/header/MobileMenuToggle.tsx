
import { Menu, X } from 'lucide-react';

interface MobileMenuToggleProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

const MobileMenuToggle = ({ isOpen, toggleMenu }: MobileMenuToggleProps) => {
  return (
    <button
      className="md:hidden p-1 text-text-light hover:text-primary"
      onClick={toggleMenu}
    >
      {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </button>
  );
};

export default MobileMenuToggle;

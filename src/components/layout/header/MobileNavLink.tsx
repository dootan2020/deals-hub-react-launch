
import React from 'react';
import { Link } from 'react-router-dom';

interface MobileNavLinkProps {
  to: string;
  onClick?: () => void;
  children: React.ReactNode;
}

export const MobileNavLink = ({ to, onClick, children }: MobileNavLinkProps) => {
  return (
    <Link 
      to={to} 
      className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default MobileNavLink;


import React from 'react';

export interface MobileMenuToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MobileMenuToggle: React.FC<MobileMenuToggleProps> = ({ isOpen, onToggle }) => {
  return (
    <button
      className="md:hidden p-1 focus:outline-none"
      onClick={onToggle}
      aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
      aria-expanded={isOpen}
    >
      <div className="w-6 h-5 relative flex flex-col justify-between">
        <span 
          className={`w-full h-0.5 bg-gray-800 rounded transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}
        />
        <span 
          className={`w-full h-0.5 bg-gray-800 rounded transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}
        />
        <span 
          className={`w-full h-0.5 bg-gray-800 rounded transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}
        />
      </div>
    </button>
  );
};

export default MobileMenuToggle;

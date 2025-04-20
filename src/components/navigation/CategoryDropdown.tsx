
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

interface CategoryDropdownProps {
  className?: string;
  isOpen?: boolean;
}

const CategoryDropdown = ({ className, isOpen = false }: CategoryDropdownProps) => {
  if (!isOpen) return null;

  return (
    <div className={cn(
      "absolute left-1/2 -translate-x-1/2 mt-1 w-[900px] bg-white rounded-xl shadow-lg z-50",
      "p-8 grid grid-cols-3 gap-8",
      "transition-all duration-200 ease-in-out",
      className
    )}>
      {/* Column 1: Accounts */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Accounts</h4>
        <ul className="space-y-2">
          {['Facebook Account', 'TikTok Account', 'Shopee Account', 'Instagram Account', 'Twitter Account'].map((item) => (
            <li key={item}>
              <Link
                to="#"
                className="block px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-dark transition-colors"
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Column 2: Mail Services */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Mail Services</h4>
        <ul className="space-y-2">
          {['Gmail', 'Outlook Mail', 'ProtonMail', 'Yahoo Mail', 'iCloud Mail'].map((item) => (
            <li key={item}>
              <Link
                to="#"
                className="block px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-dark transition-colors"
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Column 3: Tools & Keys */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Tools & Keys</h4>
        <ul className="space-y-2">
          {['Capcut', 'Discord', 'Software Keys', 'Windows Keys', 'Adobe Keys'].map((item) => (
            <li key={item}>
              <Link
                to="#"
                className="block px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-dark transition-colors"
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryDropdown;

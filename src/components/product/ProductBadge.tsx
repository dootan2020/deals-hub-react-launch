
import React from 'react';
import { cn } from '@/lib/utils';

interface ProductBadgeProps {
  type: 'gmail' | 'facebook' | 'outlook' | 'default';
  className?: string;
}

export const ProductBadge: React.FC<ProductBadgeProps> = ({ type, className }) => {
  const badges = {
    gmail: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      icon: 'M'
    },
    facebook: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      icon: 'f'
    },
    outlook: {
      bg: 'bg-sky-100',
      text: 'text-sky-600',
      icon: 'O'
    },
    default: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      icon: '#'
    }
  };

  const badge = badges[type] || badges.default;

  return (
    <div className={cn(
      "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm",
      badge.bg,
      badge.text,
      className
    )}>
      {badge.icon}
    </div>
  );
};

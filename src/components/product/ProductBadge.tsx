
import React from 'react';
import { cn } from '@/lib/utils';

interface ProductBadgeProps {
  type: 'gmail' | 'facebook' | 'outlook' | 'default';
  className?: string;
}

export const ProductBadge: React.FC<ProductBadgeProps> = ({ type, className }) => {
  const badges = {
    gmail: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      label: 'G'
    },
    facebook: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      label: 'f'
    },
    outlook: {
      bg: 'bg-sky-50',
      text: 'text-sky-600',
      label: 'O'
    },
    default: {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      label: '#'
    }
  };

  const badge = badges[type] || badges.default;

  return (
    <div className={cn(
      "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-base",
      badge.bg,
      badge.text,
      className
    )}>
      {badge.label}
    </div>
  );
};

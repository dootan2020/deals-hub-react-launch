
import React from 'react';
import { Mail, Facebook, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductLogoProps {
  type: 'gmail' | 'facebook' | 'outlook' | 'default';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProductLogo: React.FC<ProductLogoProps> = ({ 
  type,
  className,
  size = 'md'
}) => {
  const sizes = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5',
  };
  
  const logos = {
    gmail: {
      icon: Mail,
      bg: 'bg-red-50',
      text: 'text-red-600',
    },
    facebook: {
      icon: Facebook,
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
    outlook: {
      icon: Mail,
      bg: 'bg-sky-50',
      text: 'text-sky-600',
    },
    default: {
      icon: KeyRound,
      bg: 'bg-gray-50',
      text: 'text-gray-600',
    }
  };

  const logo = logos[type];
  const Icon = logo.icon;

  return (
    <div className={cn(
      "rounded-lg flex items-center justify-center",
      sizes[size],
      logo.bg,
      logo.text,
      className
    )}>
      <Icon className="w-full h-full" />
    </div>
  );
};

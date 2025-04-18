
import React from 'react';
import { cn } from '@/lib/utils';
import { Mail, Facebook, KeyRound } from "lucide-react";

interface ProductBadgeProps {
  type: 'gmail' | 'facebook' | 'outlook' | 'default';
  className?: string;
}

const getBrandType = (type: string): 'gmail' | 'facebook' | 'outlook' | 'default' => {
  const lowercaseType = type.toLowerCase();
  if (lowercaseType.includes('gmail')) return 'gmail';
  if (lowercaseType.includes('facebook')) return 'facebook';
  if (lowercaseType.includes('outlook')) return 'outlook';
  return 'default';
};

export const ProductBadge: React.FC<ProductBadgeProps> = ({ type, className }) => {
  const badges = {
    gmail: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      icon: Mail,
      label: 'Gmail'
    },
    facebook: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      icon: Facebook,
      label: 'Facebook'
    },
    outlook: {
      bg: 'bg-sky-50',
      text: 'text-sky-600',
      icon: Mail,
      label: 'Outlook'
    },
    default: {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      icon: KeyRound,
      label: '#'
    }
  };

  const badge = badges[type] || badges.default;
  const Icon = badge.icon;

  return (
    <div className={cn(
      "w-8 h-8 rounded-full flex items-center justify-center",
      badge.bg,
      badge.text,
      className
    )}>
      <Icon className="w-4 h-4" />
    </div>
  );
};


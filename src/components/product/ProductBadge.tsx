
import React from 'react';
import { cn } from '@/lib/utils';
import { Mail, Facebook, KeyRound } from "lucide-react";

interface ProductBadgeProps {
  type: 'gmail' | 'facebook' | 'outlook' | 'default';
  className?: string;
}

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

  const badge = badges[type];
  const Icon = badge.icon;

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full",
      badge.bg,
      badge.text,
      className
    )}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{badge.label}</span>
    </div>
  );
};

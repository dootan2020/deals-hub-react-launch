
import React from 'react';
import { Mail, Facebook, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ProductLogoProps {
  type: 'gmail' | 'facebook' | 'outlook' | 'default';
  className?: string;
  size?: number;
}

export const ProductLogo: React.FC<ProductLogoProps> = ({ 
  type,
  className,
  size = 24
}) => {
  const logos = {
    gmail: {
      icon: Mail,
      bg: 'bg-red-50',
      text: 'text-red-600',
      label: 'Gmail'
    },
    facebook: {
      icon: Facebook,
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      label: 'Facebook'
    },
    outlook: {
      icon: Mail,
      bg: 'bg-sky-50',
      text: 'text-sky-600',
      label: 'Outlook'
    },
    default: {
      icon: KeyRound,
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      label: 'Digital Product'
    }
  };

  const logo = logos[type];
  const Icon = logo.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={cn(
            "rounded-lg p-2 transition-colors duration-200",
            logo.bg,
            logo.text,
            className
          )}>
            <Icon size={size} className="shrink-0" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{logo.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

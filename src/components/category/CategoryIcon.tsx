
import React from 'react';
import { 
  Mail, 
  UserRound, 
  KeyRound, 
  Package, 
  Smartphone, 
  Gamepad2, 
  CreditCard,
  ShieldCheck,
  Code,
  Wallet,
  Network,
  Globe,
  Subtitles,
  Television,
  Headphones,
  Layers,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  MessageSquare,
  PlayCircle,
  Share2,
  Mail as IconMail,
  LucideIcon,
  LucideProps
} from "lucide-react";

export type CategoryIconName = 
  | 'email'
  | 'social'
  | 'software'
  | 'digital'
  | 'accounts'
  | 'gaming'
  | 'payment'
  | 'security'
  | 'development'
  | 'wallet'
  | 'network'
  | 'website'
  | 'subtitle'
  | 'streaming'
  | 'audio'
  | 'vpn'
  | 'facebook'
  | 'twitter'
  | 'instagram'
  | 'linkedin'
  | 'youtube'
  | 'messenger'
  | 'video'
  | 'sharing'
  | 'mail';

interface CategoryIconProps extends LucideProps {
  category: CategoryIconName | string;
}

const iconMap: Record<CategoryIconName, LucideIcon> = {
  email: Mail,
  social: Share2,
  software: Package,
  digital: Layers,
  accounts: UserRound,
  gaming: Gamepad2,
  payment: CreditCard,
  security: ShieldCheck,
  development: Code,
  wallet: Wallet,
  network: Network,
  website: Globe,
  subtitle: Subtitles,
  streaming: PlayCircle,
  audio: Headphones,
  vpn: Network,
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  messenger: MessageSquare,
  video: Television,
  sharing: Share2,
  mail: IconMail
};

// Fallback mapping for common terms to icon names
const fallbackMapping: Record<string, CategoryIconName> = {
  'emails': 'email',
  'mail': 'email',
  'gmail': 'email',
  'hotmail': 'email',
  'yahoo': 'email',
  'outlook': 'email',
  'socials': 'social',
  'socialmedia': 'social',
  'facebook': 'facebook',
  'instagram': 'instagram',
  'twitter': 'twitter',
  'linkedin': 'linkedin',
  'youtube': 'youtube',
  'softwares': 'software',
  'applications': 'software',
  'apps': 'software',
  'keys': 'software',
  'licenses': 'software',
  'accounts': 'accounts',
  'logins': 'accounts',
  'users': 'accounts',
  'profiles': 'accounts',
  'games': 'gaming',
  'gaming': 'gaming',
  'videogames': 'gaming',
  'payments': 'payment',
  'credit': 'payment',
  'debit': 'payment',
  'cards': 'payment',
  'security': 'security',
  'protection': 'security',
  'antivirus': 'security',
  'development': 'development',
  'programming': 'development',
  'coding': 'development',
  'developer': 'development',
  'wallets': 'wallet',
  'crypto': 'wallet',
  'cryptocurrency': 'wallet',
  'bitcoins': 'wallet',
  'networks': 'network',
  'networking': 'network',
  'websites': 'website',
  'domains': 'website',
  'hosting': 'website',
  'subtitles': 'subtitle',
  'captions': 'subtitle',
  'translations': 'subtitle',
  'streaming': 'streaming',
  'stream': 'streaming',
  'tvshows': 'streaming',
  'movies': 'streaming',
  'audio': 'audio',
  'music': 'audio',
  'sounds': 'audio',
  'vpn': 'vpn',
  'proxy': 'vpn',
  'digital': 'digital'
};

const CategoryIcon: React.FC<CategoryIconProps> = ({ category, ...props }) => {
  // Normalize category name to lowercase and remove spaces
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '');
  
  // Try to find in the direct map first
  let Icon = iconMap[normalizedCategory as CategoryIconName];
  
  // If not found, try the fallback mapping
  if (!Icon && fallbackMapping[normalizedCategory]) {
    const mappedCategory = fallbackMapping[normalizedCategory];
    Icon = iconMap[mappedCategory];
  }
  
  // Default to Package icon if no match found
  if (!Icon) {
    Icon = Package;
  }
  
  return <Icon {...props} />;
};

export default CategoryIcon;

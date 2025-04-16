
import { Product, Category } from '../types';

export const categories: Category[] = [
  {
    id: 'email',
    name: 'Email Accounts',
    description: 'Premium email accounts with verified status',
    image: '/images/categories/email.png',
    slug: 'email-accounts',
    count: 15,
  },
  {
    id: 'account',
    name: 'Gaming Accounts',
    description: 'Premium gaming accounts with high stats and rare items',
    image: '/images/categories/account.png',
    slug: 'gaming-accounts',
    count: 24,
  },
  {
    id: 'other',
    name: 'Software Keys',
    description: 'Licensed software keys at discounted prices',
    image: '/images/categories/other.png',
    slug: 'software-keys',
    count: 18,
  },
];

export const featuredProducts: Product[] = [
  {
    id: '1',
    title: 'Gmail Premium Account',
    description: 'Fully verified Gmail account with premium features and security',
    price: 9.99,
    originalPrice: 14.99,
    images: ['https://placehold.co/300x300?text=Gmail'],
    categoryId: 'email',
    rating: 4.8,
    reviewCount: 124,
    inStock: true,
    badges: ['Featured', 'Best Seller'],
    slug: 'gmail-premium-account',
  },
  {
    id: '2',
    title: 'World of Warcraft Account',
    description: 'Level 60 WoW account with rare mounts and achievements',
    price: 59.99,
    originalPrice: 79.99,
    images: ['https://placehold.co/300x300?text=WoW'],
    categoryId: 'account',
    rating: 4.9,
    reviewCount: 87,
    inStock: true,
    badges: ['Hot'],
    slug: 'wow-account',
  },
  {
    id: '3',
    title: 'Office 365 License Key',
    description: 'Lifetime license key for Microsoft Office 365',
    price: 29.99,
    originalPrice: 49.99,
    images: ['https://placehold.co/300x300?text=Office'],
    categoryId: 'other',
    rating: 4.7,
    reviewCount: 215,
    inStock: true,
    badges: ['40% OFF'],
    slug: 'office-365-key',
  },
  {
    id: '4',
    title: 'Outlook Premium Account',
    description: 'Premium Outlook account with 5TB storage and advanced features',
    price: 12.99,
    originalPrice: 19.99,
    images: ['https://placehold.co/300x300?text=Outlook'],
    categoryId: 'email',
    rating: 4.5,
    reviewCount: 78,
    inStock: true,
    badges: [],
    slug: 'outlook-premium',
  },
  {
    id: '5',
    title: 'Fortnite Rare Skin Account',
    description: 'Fortnite account with over 100 rare skins and items',
    price: 79.99,
    originalPrice: 99.99,
    images: ['https://placehold.co/300x300?text=Fortnite'],
    categoryId: 'account',
    rating: 4.9,
    reviewCount: 142,
    inStock: false,
    badges: ['Hot', '20% OFF'],
    slug: 'fortnite-rare-skins',
  },
  {
    id: '6',
    title: 'Windows 11 Pro Key',
    description: 'Genuine Windows 11 Professional activation key',
    price: 39.99,
    originalPrice: 69.99,
    images: ['https://placehold.co/300x300?text=Windows11'],
    categoryId: 'other',
    rating: 4.8,
    reviewCount: 230,
    inStock: true,
    badges: ['Featured'],
    slug: 'windows-11-pro',
  },
];

export const allProducts: Product[] = [
  ...featuredProducts,
  {
    id: '7',
    title: 'ProtonMail Premium Account',
    description: 'Secure and private ProtonMail account with premium features',
    price: 15.99,
    originalPrice: 24.99,
    images: ['https://placehold.co/300x300?text=ProtonMail'],
    categoryId: 'email',
    rating: 4.7,
    reviewCount: 93,
    inStock: true,
    badges: [],
    slug: 'protonmail-premium',
  },
  {
    id: '8',
    title: 'League of Legends Account',
    description: 'Level 30 LoL account with all champions unlocked',
    price: 49.99,
    originalPrice: 69.99,
    images: ['https://placehold.co/300x300?text=LoL'],
    categoryId: 'account',
    rating: 4.6,
    reviewCount: 128,
    inStock: true,
    badges: ['30% OFF'],
    slug: 'lol-all-champions',
  },
  {
    id: '9',
    title: 'Adobe Creative Cloud Key',
    description: '1 Year subscription key for Adobe Creative Cloud All Apps',
    price: 149.99,
    originalPrice: 239.99,
    images: ['https://placehold.co/300x300?text=Adobe'],
    categoryId: 'other',
    rating: 4.9,
    reviewCount: 176,
    inStock: true,
    badges: ['Limited'],
    slug: 'adobe-cc-key',
  },
];

export const testimonials = [
  {
    id: '1',
    name: 'John Doe',
    role: 'Game Developer',
    content: 'I purchased a premium account from Digital Deals Hub and was impressed by the smooth transaction and instant delivery. Will definitely shop again!',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '2',
    name: 'Sarah Smith',
    role: 'Digital Marketer',
    content: 'The Microsoft Office key I bought has been working perfectly. Customer service was excellent when I had questions. Highly recommended!',
    rating: 4,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '3',
    name: 'Michael Brown',
    role: 'Software Engineer',
    content: 'I was skeptical at first, but the gaming account I purchased had even more items than advertised. Great value for money.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
  },
  {
    id: '4',
    name: 'Emma Wilson',
    role: 'Content Creator',
    content: 'Quick delivery and excellent customer support. The product worked exactly as described. Will be a returning customer!',
    rating: 4,
    avatar: 'https://randomuser.me/api/portraits/women/23.jpg',
  },
];

export function getProductsByCategory(categoryId: string): Product[] {
  return allProducts.filter(product => product.categoryId === categoryId);
}

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find(product => product.slug === slug);
}

export function getProduct(id: string): Product | undefined {
  return allProducts.find(product => product.id === id);
}

export function getRelatedProducts(product: Product, limit: number = 4): Product[] {
  return allProducts
    .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, limit);
}

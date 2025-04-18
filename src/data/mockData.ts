import { Product } from '@/types';

const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Gmail USA 2023',
    description: 'High-quality Gmail accounts with unique phone verification',
    shortDescription: 'Gmail USA accounts',
    price: 15000,
    originalPrice: 20000,
    images: ['/images/gmail-usa.jpg'],
    categoryId: 'email-accounts',
    rating: 4.5,
    reviewCount: 120,
    inStock: true,
    stockQuantity: 100,
    stock: 100,
    badges: ['Best Seller', 'New'],
    slug: 'gmail-usa-2023',
    features: [
      'Unique phone verification',
      'Aged accounts',
      'Full recovery access'
    ],
    specifications: {
      country: 'USA',
      type: 'Gmail',
      recovery: true
    },
    salesCount: 50,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Facebook Aged Accounts',
    description: 'Aged Facebook accounts with real friends and activity history. Perfect for marketing and business purposes.',
    shortDescription: 'Aged Facebook accounts with history',
    price: 25000,
    originalPrice: 35000,
    images: ['/images/facebook-aged.jpg'],
    categoryId: 'social-accounts',
    rating: 4.8,
    reviewCount: 89,
    inStock: true,
    stockQuantity: 45,
    stock: 45,
    badges: ['Premium', 'Verified'],
    slug: 'facebook-aged-accounts',
    features: [
      'Real friends and connections',
      'Activity history',
      'Profile pictures and posts',
      'Email access included'
    ],
    specifications: {
      country: 'Mixed',
      age: '2+ years',
      friends: '50-200',
      recovery: true
    },
    salesCount: 37,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Instagram Followers',
    description: 'High-quality Instagram followers to boost your social presence. Real-looking accounts with profile pictures.',
    shortDescription: 'Real-looking Instagram followers',
    price: 8000,
    originalPrice: 10000,
    images: ['/images/instagram-followers.jpg'],
    categoryId: 'social-services',
    rating: 4.2,
    reviewCount: 215,
    inStock: true,
    stockQuantity: 1000,
    stock: 1000,
    badges: ['Popular', 'Fast Delivery'],
    slug: 'instagram-followers',
    features: [
      'High-quality accounts',
      'No drop guarantee',
      'Fast delivery',
      'Natural growth pattern'
    ],
    specifications: {
      quality: 'High',
      delivery: '1-3 days',
      guarantee: '30 days',
      maxOrder: 10000
    },
    salesCount: 189,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'YouTube Premium Account',
    description: 'YouTube Premium accounts with ad-free viewing, background play, and YouTube Music access.',
    shortDescription: 'Ad-free YouTube experience',
    price: 35000,
    originalPrice: 45000,
    images: ['/images/youtube-premium.jpg'],
    categoryId: 'streaming-accounts',
    rating: 4.7,
    reviewCount: 67,
    inStock: true,
    stockQuantity: 30,
    stock: 30,
    badges: ['Premium', 'Warranty'],
    slug: 'youtube-premium-account',
    features: [
      'Ad-free viewing',
      'Background play',
      'YouTube Music access',
      'Download videos'
    ],
    specifications: {
      duration: '12 months',
      devices: 'Unlimited',
      warranty: '3 months',
      type: 'Family account'
    },
    salesCount: 42,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    title: 'Netflix Premium 4K',
    description: 'Netflix Premium accounts with 4K Ultra HD streaming on up to 4 devices simultaneously.',
    shortDescription: '4K streaming on 4 devices',
    price: 45000,
    originalPrice: 60000,
    images: ['/images/netflix-premium.jpg'],
    categoryId: 'streaming-accounts',
    rating: 4.9,
    reviewCount: 132,
    inStock: true,
    stockQuantity: 25,
    stock: 25,
    badges: ['Premium', '4K', 'Warranty'],
    slug: 'netflix-premium-4k',
    features: [
      '4K Ultra HD streaming',
      'Watch on 4 devices at once',
      'Download shows to watch offline',
      'No ads or interruptions'
    ],
    specifications: {
      plan: 'Premium',
      duration: '12 months',
      devices: 4,
      quality: '4K Ultra HD',
      warranty: '3 months'
    },
    salesCount: 98,
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    title: 'Spotify Premium',
    description: 'Spotify Premium accounts with ad-free music listening, offline downloads, and high-quality audio.',
    shortDescription: 'Ad-free music streaming',
    price: 30000,
    originalPrice: 40000,
    images: ['/images/spotify-premium.jpg'],
    categoryId: 'streaming-accounts',
    rating: 4.6,
    reviewCount: 94,
    inStock: true,
    stockQuantity: 50,
    stock: 50,
    badges: ['Premium', 'Popular'],
    slug: 'spotify-premium',
    features: [
      'Ad-free music listening',
      'Download songs for offline listening',
      'High-quality audio',
      'Unlimited skips'
    ],
    specifications: {
      plan: 'Premium Individual',
      duration: '12 months',
      devices: 'Unlimited',
      quality: 'Very high (320 kbps)',
      warranty: '2 months'
    },
    salesCount: 76,
    createdAt: new Date().toISOString()
  },
  {
    id: '7',
    title: 'Twitter Verified Accounts',
    description: 'Aged Twitter accounts with verified status and established following. Perfect for influencers and businesses.',
    shortDescription: 'Verified Twitter accounts',
    price: 120000,
    originalPrice: 150000,
    images: ['/images/twitter-verified.jpg'],
    categoryId: 'social-accounts',
    rating: 4.8,
    reviewCount: 23,
    inStock: false,
    stockQuantity: 0,
    stock: 0,
    badges: ['Premium', 'Verified', 'Rare'],
    slug: 'twitter-verified-accounts',
    features: [
      'Blue verification badge',
      'Established following',
      'Complete account access',
      'Email access included'
    ],
    specifications: {
      followers: '10,000+',
      age: '3+ years',
      verification: true,
      recovery: true
    },
    salesCount: 12,
    createdAt: new Date().toISOString()
  },
  {
    id: '8',
    title: 'Discord Nitro',
    description: 'Discord Nitro subscription with custom emojis, higher upload limits, and HD video streaming.',
    shortDescription: 'Enhanced Discord experience',
    price: 25000,
    originalPrice: 30000,
    images: ['/images/discord-nitro.jpg'],
    categoryId: 'gaming-accounts',
    rating: 4.5,
    reviewCount: 47,
    inStock: true,
    stockQuantity: 35,
    stock: 35,
    badges: ['Gaming', 'Popular'],
    slug: 'discord-nitro',
    features: [
      'Custom emoji anywhere',
      'Higher upload limit (100MB)',
      'HD video streaming',
      'Animated avatar and custom tag'
    ],
    specifications: {
      plan: 'Nitro',
      duration: '12 months',
      perks: 'Server boosts, custom tag',
      warranty: '1 month'
    },
    salesCount: 31,
    createdAt: new Date().toISOString()
  }
];

export const testimonials = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    role: 'Digital Marketer',
    content: 'Dịch vụ của Digital Deals Hub rất chuyên nghiệp và nhanh chóng. Tôi đã mua nhiều tài khoản và luôn hài lòng.',
    avatar: '/images/avatars/avatar1.jpg',
    rating: 4.5
  },
  {
    id: '2',
    name: 'Trần Thị B',
    role: 'Social Media Manager',
    content: 'Các sản phẩm ở đây đáng tin cậy và giá cả hợp lý. Đặc biệt là dịch vụ hỗ trợ rất nhiệt tình.',
    avatar: '/images/avatars/avatar2.jpg',
    rating: 5
  },
  {
    id: '3',
    name: 'Lê Văn C',
    role: 'Freelancer',
    content: 'Đã sử dụng nhiều dịch vụ từ Digital Deals Hub. Luôn được hỗ trợ nhanh chóng và chuyên nghiệp.',
    avatar: '/images/avatars/avatar3.jpg',
    rating: 4
  }
];

export default mockProducts;

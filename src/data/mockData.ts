import { Product } from '@/types';

// Mock products data - make sure to fix type errors
export const mockProducts: Product[] = [
  {
    id: "1",
    title: "Gmail Account Pack",
    description: "Pack of high-quality Gmail accounts with recovery options and full access.",
    short_description: "Premium Gmail accounts with phone verification",
    price: 100000,
    original_price: 150000,
    images: ["/assets/products/gmail.png"],
    category_id: "email-accounts",
    rating: 4.5,
    review_count: 120,
    in_stock: true,
    slug: "gmail-account-pack",
    stock: 50,
    stock_quantity: 50,
    badges: ["Best Seller", "Verified"],
    features: [
      "Phone verified accounts",
      "Custom recovery options",
      "Instant delivery",
      "6-month warranty"
    ],
    specifications: {
      age: "Fresh",
      region: "USA",
      delivery: "Instant",
      warranty: "6 months"
    },
    created_at: "2023-01-15T10:30:00Z",
    updated_at: "2023-04-10T14:20:00Z",
    kiosk_token: "gmail-pack-token"
  },
  {
    id: "2",
    title: "Facebook Ad Account",
    description: "Verified Facebook Ad accounts with spending limit and business manager access.",
    short_description: "Business-ready Facebook Ad accounts",
    price: 250000,
    original_price: 300000,
    images: ["/assets/products/facebook.png"],
    category_id: "social-media",
    rating: 4.8,
    review_count: 85,
    in_stock: true,
    slug: "facebook-ad-account",
    stock: 30,
    stock_quantity: 30,
    badges: ["Premium", "Verified"],
    features: [
      "Business Manager ready",
      "$250 initial spending limit",
      "Aged accounts",
      "Full access guaranteed"
    ],
    specifications: {
      age: "3+ months",
      region: "Worldwide",
      delivery: "Instant",
      warranty: "30 days"
    },
    created_at: "2023-02-20T09:15:00Z",
    updated_at: "2023-04-15T11:45:00Z",
    kiosk_token: "fb-ad-token"
  },
  {
    id: "3",
    title: "Instagram Account Pack",
    description: "Pack of Instagram accounts with followers and engagement history.",
    short_description: "Aged Instagram accounts with real followers",
    price: 180000,
    original_price: 220000,
    images: ["/assets/products/instagram.png"],
    category_id: "social-media",
    rating: 4.2,
    review_count: 64,
    in_stock: true,
    slug: "instagram-account-pack",
    stock: 25,
    stock_quantity: 25,
    badges: ["Popular"],
    features: [
      "1000+ real followers",
      "Active engagement history",
      "Email verified",
      "Avatar and bio included"
    ],
    specifications: {
      age: "6+ months",
      region: "Mixed",
      delivery: "12 hours",
      warranty: "14 days"
    },
    created_at: "2023-03-05T14:20:00Z",
    updated_at: "2023-04-12T16:30:00Z",
    kiosk_token: "insta-pack-token"
  }
] as unknown as Product[];

// Additional mock data as needed...

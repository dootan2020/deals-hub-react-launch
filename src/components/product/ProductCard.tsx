
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BuyNowButton } from "@/components/checkout/BuyNowButton";
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  images?: string[];
  slug: string;
  badges?: string[];
  in_stock: boolean;
  category_id?: string;
}

interface ProductCardProps {
  product: Product;
  loading?: boolean;
}

export function ProductCard({ product, loading = false }: ProductCardProps) {
  if (loading) {
    return <ProductCardSkeleton />;
  }
  
  const discount = product.original_price && product.original_price > product.price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;
    
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://placehold.co/400x300?text=No+Image';
    
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="relative">
        <Link to={`/products/${product.slug}`}>
          <div className="aspect-[4/3] overflow-hidden bg-gray-100">
            <img 
              src={imageUrl} 
              alt={product.title} 
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </div>
          
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              -{discount}%
            </Badge>
          )}
          
          {product.badges && product.badges.map((badge, index) => (
            <Badge 
              key={index} 
              variant="outline"
              className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm"
            >
              {badge}
            </Badge>
          ))}
        </Link>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-2 min-h-[48px]">
          <Link 
            to={`/products/${product.slug}`} 
            className="text-base font-medium line-clamp-2 hover:underline"
          >
            {product.title}
          </Link>
        </div>
        
        <div className="flex justify-between items-end">
          <div>
            <div className="font-bold text-lg text-primary">
              {product.price.toLocaleString()} VND
            </div>
            
            {discount > 0 && (
              <div className="text-sm text-gray-500 line-through">
                {product.original_price?.toLocaleString()} VND
              </div>
            )}
          </div>
          
          <BuyNowButton 
            productId={product.id}
            className="h-8 text-xs px-3"
            onPurchaseSuccess={() => {}}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] bg-gray-200">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-4">
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

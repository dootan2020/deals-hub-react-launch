
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category, Product } from '@/types';
import { SubcategoryDisplay } from '@/types/category.types';

export const useSubcategories = (categoryId?: string) => {
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!categoryId) return;
      
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', categoryId);
        
      if (data) {
        const mappedSubcategories: Category[] = data.map(sub => ({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          image: sub.image,
          count: sub.count || 0,
          parent_id: sub.parent_id
        }));
        
        setSubcategories(mappedSubcategories);

        const { data: featuredData } = await supabase
          .from('products')
          .select('*')
          .in('category_id', data.map(sub => sub.id))
          .limit(4);
          
        if (featuredData) {
          const mappedProducts: Product[] = featuredData.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            shortDescription: p.short_description || '',
            price: Number(p.price),
            originalPrice: p.original_price ? Number(p.original_price) : undefined,
            images: p.images || [],
            categoryId: p.category_id,
            rating: Number(p.rating || 0),
            reviewCount: p.review_count || 0,
            inStock: p.in_stock || false,
            stockQuantity: p.stock_quantity || 0,
            badges: p.badges || [],
            slug: p.slug,
            features: p.features || [],
            specifications: p.specifications as Record<string, string | number | boolean | object>,
            createdAt: p.created_at
          }));
          
          setFeaturedProducts(mappedProducts);
        }
      }
    };

    fetchSubcategories();
  }, [categoryId]);

  return { subcategories, featuredProducts };
};


import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SubcategoryPillsProps {
  subcategories: Category[];
  onSubcategoryClick?: (category: Category) => void;
}

const SubcategoryPills = ({ subcategories, onSubcategoryClick }: SubcategoryPillsProps) => {
  if (!subcategories.length) return null;

  return (
    <div className="w-full mb-6">
      <ScrollArea className="w-full" orientation="horizontal">
        <div className="flex gap-3 pb-4 px-1">
          {subcategories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              onClick={(e) => {
                if (onSubcategoryClick) {
                  e.preventDefault();
                  onSubcategoryClick(category);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 hover:bg-primary/10 text-sm font-medium transition-colors whitespace-nowrap"
            >
              {category.name}
              {category.count > 0 && (
                <span className="text-xs text-muted-foreground">({category.count})</span>
              )}
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SubcategoryPills;

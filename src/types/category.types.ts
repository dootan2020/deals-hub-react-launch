import { Category } from '@/types';

export interface CategoryWithParent extends Category {
  parent?: CategoryWithParent;
  created_at?: string;
  icon?: string;
  tags?: string[];
}

export interface CategoryPageParams extends Record<string, string> {
  categorySlug?: string;
  parentCategorySlug?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export interface CategoryFilters {
  sort?: string;
}

export interface SubcategoryDisplay {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  count: number;
}

export interface SubcategoryItem {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryWithSubs {
  id: string;
  name: string;
  description: string;
  slug: string;
  topSubcategories: SubcategoryItem[];
  totalSubcategories: number;
}

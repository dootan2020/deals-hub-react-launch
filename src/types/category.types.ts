
import { Category } from '@/types';

export interface CategoryWithParent extends Category {
  parent?: CategoryWithParent;
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

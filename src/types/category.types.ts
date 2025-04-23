
// Basic category type definitions

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string;
  description?: string;
  image?: string;
  count?: number;
}

export interface CategoryWithSubcategories {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  count?: number;
  subcategories: SubCategory[];
}

export interface CategoryBreadcrumb {
  id: string;
  name: string;
  slug: string;
}

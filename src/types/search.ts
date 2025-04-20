
export interface SearchProduct {
  id: string;
  title: string;
  price: number;
  slug: string;
  category_id: string;
  categories?: {
    name: string;
    id?: string;
    slug?: string;
  };
}

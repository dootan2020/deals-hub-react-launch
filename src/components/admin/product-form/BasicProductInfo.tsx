import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { SearchableCategorySelect } from '@/components/admin/SearchableCategorySelect';
import { Category } from '@/types';

interface BasicProductInfoProps {
  categories: Category[];
}

export function BasicProductInfo({ categories }: BasicProductInfoProps) {
  const form = useFormContext();

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    form.setValue('slug', value);
  };

  const generateSlugFromTitle = () => {
    const title = form.getValues('title');
    if (!title) return;
    
    const slug = title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    form.setValue('slug', slug);
  };

  // Ensure we have a valid array of categories with proper formatting
  const formattedCategories = categories && Array.isArray(categories) 
    ? categories
        .filter(cat => cat && typeof cat === 'object') // Filter out null/undefined
        .map(cat => ({ 
          id: cat.id || '',
          name: cat.name || ''
        }))
    : [];

  return (
    <>
      <FormField
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Title</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter product title" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Enter product description" 
                className="min-h-32"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price ($)</FormLabel>
              <FormControl>
                <Input {...field} type="number" step="0.01" min="0" placeholder="0.00" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="originalPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Original Price ($) (optional)</FormLabel>
              <FormControl>
                <Input {...field} type="number" step="0.01" min="0" placeholder="0.00" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <FormControl>
              <SearchableCategorySelect
                categories={formattedCategories}
                value={field.value || ''}
                onValueChange={field.onChange}
                placeholder="Search and select a category"
                disabled={formattedCategories.length === 0}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="inStock"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">In Stock</FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="product-slug" 
                    onChange={(e) => {
                      handleSlugChange(e);
                    }} 
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={generateSlugFromTitle}
                >
                  Generate
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="externalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>External ID (optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="External product ID" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        name="images"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Image URLs (one per line)</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="https://example.com/image1.jpg
https://example.com/image2.jpg"
                className="min-h-32"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

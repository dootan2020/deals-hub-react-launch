
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

export function ProductBasicInfoFields() {
  const form = useFormContext();

  const generateSlugFromTitle = () => {
    const title = form.getValues('title');
    const slug = title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    form.setValue('slug', slug);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    form.setValue('slug', value);
  };

  return (
    <div className="space-y-6">
      <FormField
        name="title"
        control={form.control}
        rules={{ required: "Title is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Title <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter product title" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="description"
        control={form.control}
        rules={{ required: "Description is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <RichTextEditor 
                value={field.value} 
                onChange={field.onChange}
                placeholder="Enter product description..."
                height="300px"
              />
            </FormControl>
            <FormDescription>
              Format your description using the toolbar above
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="slug"
        control={form.control}
        rules={{ 
          required: "Slug is required",
          pattern: {
            value: /^[a-z0-9-]+$/,
            message: "Slug must contain only lowercase letters, numbers, and hyphens"
          }
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug <span className="text-red-500">*</span></FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="product-slug" 
                  onChange={handleSlugChange}
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
            <FormDescription>
              URL-friendly version of the product name
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}


import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function ProductBasicInfoFields() {
  const form = useFormContext();
  
  const generateSlugFromTitle = () => {
    const title = form.getValues('title');
    if (!title) return;
    
    const slug = title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
    
    form.setValue('slug', slug, { shouldValidate: true });
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Basic Information</h3>
      
      <FormField
        control={form.control}
        name="title"
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
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="Enter product description" className="min-h-[100px]" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug <span className="text-red-500">*</span></FormLabel>
              <div className="flex space-x-2">
                <FormControl>
                  <Input {...field} placeholder="product-slug" />
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
                URL-friendly identifier for the product
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="externalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>External ID</FormLabel>
              <FormControl>
                <Input {...field} placeholder="External product ID (optional)" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

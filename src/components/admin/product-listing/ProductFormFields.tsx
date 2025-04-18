import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/types';
import { useFormContext } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '@/styles/quill.css';
import { ImageUploader } from '../product-form/ImageUploader';

interface ProductFormFieldsProps {
  categories: Category[];
  isEditMode: boolean;
}

export function ProductFormFields({ categories, isEditMode }: ProductFormFieldsProps) {
  const form = useFormContext();

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    form.setValue('slug', value);
  };

  const generateSlugFromTitle = () => {
    const title = form.getValues('title');
    const slug = title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    form.setValue('slug', slug);
  };

  // Rich text editor configuration
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'bold', 'italic', 'underline',
    'list', 'bullet', 'link'
  ];

  return (
    <div className="space-y-6">
      <FormField
        name="kioskToken"
        control={form.control}
        rules={{ required: "Kiosk Token is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kiosk Token <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input placeholder="e.g. DUP32BXSLWAP4847J84B" {...field} />
            </FormControl>
            <FormDescription>
              Token for API synchronization
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="title"
        control={form.control}
        rules={{ required: "Title is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Title <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter product title" 
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  if (!isEditMode && !form.getValues('slug')) {
                    form.setValue('slug', generateSlugFromTitle);
                  }
                }}
              />
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
              <div className="rich-text-editor">
                <ReactQuill 
                  theme="snow" 
                  value={field.value} 
                  onChange={field.onChange}
                  modules={modules}
                  formats={formats}
                  className="min-h-[200px] mb-12"
                />
              </div>
            </FormControl>
            <FormDescription>
              Format your description using the toolbar above
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          name="price"
          control={form.control}
          rules={{ 
            required: "Price is required",
            min: { value: 0, message: "Price must be 0 or higher" }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (VND) <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  step="1" 
                  placeholder="0" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          name="originalPrice"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Original Price</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0"
                  step="1"
                  placeholder="Original price (for discounts)" 
                  value={field.value || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : undefined;
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormDescription>
                Leave empty if no discount
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="stock"
          control={form.control}
          rules={{ 
            required: "Stock is required",
            min: { value: 0, message: "Stock must be 0 or higher" }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Available quantity"
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    field.onChange(value);
                    // Update inStock based on stock value
                    form.setValue('inStock', value > 0);
                  }}
                />
              </FormControl>
              <FormDescription>
                Available quantity
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        name="categoryId"
        control={form.control}
        rules={{ required: "Category is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
              <FormDescription>
                URL-friendly version of the product name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="externalId"
          control={form.control}
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
        name="inStock"
        control={form.control}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">In Stock</FormLabel>
              <FormDescription>
                Is this product available for purchase?
              </FormDescription>
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

      {/* Image Uploader */}
      <ImageUploader 
        existingImages={
          form.getValues('images') 
            ? (typeof form.getValues('images') === 'string' 
                ? form.getValues('images').split('\n').filter(Boolean)
                : [])
            : []
        } 
      />
    </div>
  );
}

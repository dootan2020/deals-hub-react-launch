
import { useFormContext } from 'react-hook-form';
import { 
  FormField, FormItem, FormLabel, FormControl, 
  FormMessage, FormDescription 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '@/styles/quill.css';

export function ProductBasicInfoFields() {
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
              <button 
                type="button"
                className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                onClick={generateSlugFromTitle}
              >
                Generate
              </button>
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

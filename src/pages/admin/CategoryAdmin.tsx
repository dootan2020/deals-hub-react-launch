import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { Category } from '@/types';

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  image: z.string().url("Image must be a valid URL"),
  parent_id: z.string().nullable().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
  isExpanded?: boolean;
}

const CategoryAdmin = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesHierarchy, setCategoriesHierarchy] = useState<CategoryWithChildren[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      slug: '',
      image: '',
      parent_id: null,
    }
  });

  const editForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      slug: '',
      image: '',
      parent_id: null,
    }
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory && isEditOpen) {
      editForm.reset({
        name: selectedCategory.name,
        description: selectedCategory.description,
        slug: selectedCategory.slug,
        image: selectedCategory.image,
        parent_id: selectedCategory.parent_id || null,
      });
    }
  }, [selectedCategory, isEditOpen, editForm]);

  useEffect(() => {
    if (categories.length > 0) {
      const hierarchy = buildCategoryHierarchy(categories);
      setCategoriesHierarchy(hierarchy);
    }
  }, [categories]);

  const buildCategoryHierarchy = (categories: Category[]): CategoryWithChildren[] => {
    const categoriesMap: Record<string, CategoryWithChildren> = {};
    
    categories.forEach(category => {
      categoriesMap[category.id] = { ...category, children: [] };
    });
    
    const rootCategories: CategoryWithChildren[] = [];
    
    categories.forEach(category => {
      if (category.parent_id && categoriesMap[category.parent_id]) {
        categoriesMap[category.parent_id].children?.push(categoriesMap[category.id]);
      } else {
        rootCategories.push(categoriesMap[category.id]);
      }
    });
    
    return rootCategories;
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data as Category[]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitAdd = async (data: CategoryFormValues) => {
    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          name: data.name,
          description: data.description,
          slug: data.slug,
          image: data.image,
          count: 0,
          parent_id: data.parent_id || null
        });

      if (error) throw error;

      toast.success('Category added successfully');
      fetchCategories();
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsAddOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const onSubmitEdit = async (data: CategoryFormValues) => {
    if (!selectedCategory) return;

    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: data.name,
          description: data.description,
          slug: data.slug,
          image: data.image,
          parent_id: data.parent_id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCategory.id);

      if (error) throw error;

      toast.success('Category updated successfully');
      fetchCategories();
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsEditOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDelete = async (category: Category) => {
    setDeleteError(null);
    
    try {
      const { data: subcategories, error: subcategoriesError } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', category.id)
        .limit(1);

      if (subcategoriesError) throw subcategoriesError;

      if (subcategories && subcategories.length > 0) {
        setDeleteError(`Cannot delete category "${category.name}" because it has subcategories. Please delete or reassign these subcategories first.`);
        toast.error('Cannot delete category with subcategories');
        return;
      }

      const { data: products, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', category.id)
        .limit(1);

      if (checkError) throw checkError;

      if (products && products.length > 0) {
        setDeleteError(`Cannot delete category "${category.name}" because it has products associated with it. Please reassign or delete these products first.`);
        toast.error('Cannot delete category with associated products');
        return;
      }

      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id);

      if (deleteError) throw deleteError;

      toast.success('Category deleted successfully');
      fetchCategories();
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setIsEditOpen(true);
  };

  const handleAddClick = () => {
    form.reset();
    setIsAddOpen(true);
  };

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const renderCategoryRows = (category: CategoryWithChildren, level = 0) => {
    const isExpanded = expandedCategories[category.id] || false;
    const hasChildren = category.children && category.children.length > 0;
    
    return (
      <>
        <TableRow key={category.id}>
          <TableCell className="font-medium">
            <div className="flex items-center">
              {level > 0 && (
                <div style={{ width: `${level * 20}px` }}></div>
              )}
              {hasChildren && (
                <button
                  onClick={() => toggleExpand(category.id)}
                  className="mr-2 p-1 hover:bg-gray-100 rounded-sm"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
              {!hasChildren && <div className="mr-6"></div>}
              {category.name}
            </div>
          </TableCell>
          <TableCell className="max-w-xs truncate">{category.description}</TableCell>
          <TableCell>{category.slug}</TableCell>
          <TableCell>{category.count}</TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end space-x-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleEditClick(category)}
              >
                <Edit className="w-4 h-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(category)}
              >
                <Trash2 className="w-4 h-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </TableCell>
        </TableRow>
        
        {hasChildren && isExpanded && category.children?.map(child => 
          renderCategoryRows(child, level + 1)
        )}
      </>
    );
  };

  const getParentOptions = () => {
    return categories.filter(category => {
      if (selectedCategory) {
        if (category.id === selectedCategory.id) return false;
        
        let parent_id = category.parent_id;
        while (parent_id) {
          if (parent_id === selectedCategory.id) return false;
          const parent = categories.find(c => c.id === parent_id);
          parent_id = parent ? parent.parent_id : null;
        }
      }
      return true;
    });
  };

  return (
    <AdminLayout title="Categories Management">
      <div className="flex justify-between mb-6">
        <Button onClick={handleAddClick}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Category
        </Button>
      </div>

      {deleteError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {deleteError}
        </div>
      )}

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Product Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading categories...
                </TableCell>
              </TableRow>
            ) : categoriesHierarchy.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categoriesHierarchy.map(category => renderCategoryRows(category))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add New Category</SheetTitle>
            <SheetDescription>
              Create a new category to organize your products
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitAdd)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter category name" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter category description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter category slug (e.g. email-accounts)" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parent_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Category (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a parent category (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None (Top-Level Category)</SelectItem>
                          {getParentOptions().map((category) => (
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

                <div className="flex justify-end space-x-2 pt-4">
                  <SheetClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </SheetClose>
                  <Button type="submit">Save Category</Button>
                </div>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit Category</SheetTitle>
            <SheetDescription>
              Update category details
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter category name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter category description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter category slug" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="parent_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Category (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || undefined}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a parent category (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None (Top-Level Category)</SelectItem>
                          {getParentOptions().map((category) => (
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

                <SheetFooter className="pt-4">
                  <SheetClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </SheetClose>
                  <Button type="submit">Update Category</Button>
                </SheetFooter>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
};

export default CategoryAdmin;

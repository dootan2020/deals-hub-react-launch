import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Category } from '@/types';
import { MainCategoriesTable } from '@/components/admin/categories/MainCategoriesTable';
import { SubcategoriesTable } from '@/components/admin/categories/SubcategoriesTable';
import { CategoryForm, categorySchema, CategoryFormValues } from '@/components/admin/categories/CategoryForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adaptCategory, adaptCategories } from '@/utils/dataAdapters';

const CategoryAdmin = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddMainOpen, setIsAddMainOpen] = useState(false);
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState("main");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mainCategoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      slug: '',
      image: '',
      parent_id: null,
    }
  });

  const subcategoryForm = useForm<CategoryFormValues>({
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
    if (categories.length > 0) {
      const main = categories.filter(category => !category.parentId);
      const sub = categories.filter(category => category.parentId);
      
      setMainCategories(main);
      setSubcategories(sub);
    }
  }, [categories]);

  useEffect(() => {
    if (selectedCategory && isEditOpen) {
      editForm.reset({
        name: selectedCategory.name,
        description: selectedCategory.description,
        slug: selectedCategory.slug,
        image: selectedCategory.image,
        parent_id: selectedCategory.parentId || null,
      });
    }
  }, [selectedCategory, isEditOpen, editForm]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      if (data) {
        const adaptedCategories = adaptCategories(data);
        setCategories(adaptedCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitAddMain = async (data: CategoryFormValues) => {
    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          name: data.name,
          description: data.description,
          slug: data.slug,
          image: data.image,
          count: 0,
          parent_id: null // Ensure main categories have no parent
        });

      if (error) throw error;

      toast.success('Main category added successfully');
      fetchCategories();
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsAddMainOpen(false);
      mainCategoryForm.reset();
    } catch (error) {
      console.error('Error adding main category:', error);
      toast.error('Failed to add main category');
    }
  };

  const onSubmitAddSub = async (data: CategoryFormValues) => {
    try {
      if (!data.parent_id) {
        toast.error('Parent category is required for subcategories');
        return;
      }

      const { error } = await supabase
        .from('categories')
        .insert({
          name: data.name,
          description: data.description,
          slug: data.slug,
          image: data.image,
          count: 0,
          parent_id: data.parent_id
        });

      if (error) throw error;

      toast.success('Subcategory added successfully');
      fetchCategories();
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsAddSubOpen(false);
      subcategoryForm.reset();
    } catch (error) {
      console.error('Error adding subcategory:', error);
      toast.error('Failed to add subcategory');
    }
  };

  const onSubmitEdit = async (data: CategoryFormValues) => {
    if (!selectedCategory) return;

    try {
      const isMainCategory = !selectedCategory.parentId;
      
      const parent_id = isMainCategory ? null : data.parent_id;
      
      if (!isMainCategory && !parent_id) {
        toast.error('Parent category is required for subcategories');
        return;
      }

      const { error } = await supabase
        .from('categories')
        .update({
          name: data.name,
          description: data.description,
          slug: data.slug,
          image: data.image,
          parent_id: parent_id,
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
    try {
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

  const handleAddMainClick = () => {
    mainCategoryForm.reset();
    setIsAddMainOpen(true);
  };

  const handleAddSubClick = () => {
    subcategoryForm.reset({
      name: '',
      description: '',
      slug: '',
      image: '',
      parent_id: selectedParentId || null,
    });
    
    setIsAddSubOpen(true);
  };

  const isSubcategoryTab = activeTab === "sub";
  const hasMainCategories = mainCategories.length > 0;

  return (
    <AdminLayout title="Categories Management">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="main">Main Categories</TabsTrigger>
            <TabsTrigger value="sub">Subcategories</TabsTrigger>
          </TabsList>
          
          {isSubcategoryTab ? (
            <Button 
              onClick={handleAddSubClick}
              disabled={!hasMainCategories}
              title={!hasMainCategories ? "Create a main category first" : undefined}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Subcategory
            </Button>
          ) : (
            <Button onClick={handleAddMainClick}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Main Category
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8 bg-gray-50 rounded">
            Loading categories...
          </div>
        ) : (
          <>
            <TabsContent value="main" className="mt-0">
              <div className="border rounded-md">
                <MainCategoriesTable
                  mainCategories={mainCategories}
                  onEdit={handleEditClick}
                  onDelete={handleDelete}
                  refreshCategories={fetchCategories}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="sub" className="mt-0">
              {!hasMainCategories ? (
                <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-800 font-medium">You need to create at least one main category first</p>
                  <p className="text-yellow-700 text-sm mt-1">Switch to the "Main Categories" tab to create one</p>
                </div>
              ) : (
                <div className="border rounded-md">
                  <SubcategoriesTable
                    subcategories={subcategories}
                    mainCategories={mainCategories}
                    onEdit={handleEditClick}
                    onDelete={handleDelete}
                    selectedParentId={selectedParentId}
                    setSelectedParentId={setSelectedParentId}
                  />
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>

      <Sheet open={isAddMainOpen} onOpenChange={setIsAddMainOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add Main Category</SheetTitle>
            <SheetDescription>
              Create a new main category to organize your products
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <CategoryForm 
              form={mainCategoryForm}
              onSubmit={onSubmitAddMain}
              isSubcategory={false}
              mainCategories={mainCategories}
              isEdit={false}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isAddSubOpen} onOpenChange={setIsAddSubOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add Subcategory</SheetTitle>
            <SheetDescription>
              Create a new subcategory under a main category
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <CategoryForm 
              form={subcategoryForm}
              onSubmit={onSubmitAddSub}
              isSubcategory={true}
              mainCategories={mainCategories}
              isEdit={false}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit {selectedCategory?.parentId ? 'Subcategory' : 'Main Category'}</SheetTitle>
            <SheetDescription>
              Update category details
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <CategoryForm 
              form={editForm}
              onSubmit={onSubmitEdit}
              isSubcategory={Boolean(selectedCategory?.parentId)}
              mainCategories={mainCategories}
              isEdit={true}
            />
          </div>
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
};

export default CategoryAdmin;

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types';
import { toast } from 'sonner';
import { Edit, Trash2, Plus } from 'lucide-react';
import { prepareQueryId, castArrayData } from '@/utils/supabaseHelpers';

interface CategoryTableProps {
  onEdit?: (category: Category) => void;
  onAdd?: () => void;
}

export function MainCategoriesTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .order('name');
        
      if (error) throw error;
      
      setCategories(castArrayData<Category>(data));
    } catch (error) {
      console.error(error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    // First check if this category has subcategories
    try {
      const { count: subcategoryCount, error: subcatError } = await supabase
        .from('categories')
        .select('id', { count: 'exact' })
        .eq('parent_id', prepareQueryId(id));
        
      if (subcatError) throw subcatError;
      
      if (subcategoryCount && subcategoryCount > 0) {
        toast.error(`Cannot delete: this category has ${subcategoryCount} subcategories`);
        return;
      }
      
      // Check if category has products
      const { count: productCount, error: productError } = await supabase
        .from('products')
        .select('id', { count: 'exact' })
        .eq('category_id', prepareQueryId(id));
        
      if (productError) throw productError;
      
      if (productCount && productCount > 0) {
        toast.error(`Cannot delete: this category has ${productCount} products`);
        return;
      }
      
      if (!window.confirm('Are you sure you want to delete this category?')) {
        return;
      }
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Category deleted successfully');
      fetchCategories(); // Refresh the list
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete category');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Main Categories</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">Loading...</TableCell>
            </TableRow>
          ) : categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">No categories found.</TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

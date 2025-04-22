import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types';
import { toast } from 'sonner';
import { Edit, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { prepareQueryId, castArrayData } from '@/utils/supabaseHelpers';

interface SubcategoriesTableProps {
  parentCategoryId: string;
  parentCategoryName: string;
  onBack: () => void;
}

export function SubcategoriesTable({ parentCategoryId, parentCategoryName, onBack }: SubcategoriesTableProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (parentCategoryId) {
      fetchSubcategories();
    }
  }, [parentCategoryId]);
  
  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', prepareQueryId(parentCategoryId))
        .order('name');
        
      if (error) throw error;
      
      setCategories(castArrayData<Category>(data));
    } catch (error) {
      console.error(error);
      toast.error('Failed to load subcategories');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    // Check if category has products
    try {
      const { count, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact' })
        .eq('category_id', prepareQueryId(id));
        
      if (countError) throw countError;
      
      if (count && count > 0) {
        toast.error(`Cannot delete: this subcategory has ${count} products`);
        return;
      }
      
      if (!window.confirm('Are you sure you want to delete this subcategory?')) {
        return;
      }
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Subcategory deleted successfully');
      fetchSubcategories(); // Refresh the list
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete subcategory');
    }
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Main Categories
        </Button>
        <h2 className="text-2xl font-bold">Subcategories for {parentCategoryName}</h2>
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
              <TableCell colSpan={3} className="text-center">No subcategories found.</TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <Button variant="outline" className="mt-4">
        <Plus className="h-4 w-4 mr-2" />
        Add New Subcategory
      </Button>
    </div>
  );
}

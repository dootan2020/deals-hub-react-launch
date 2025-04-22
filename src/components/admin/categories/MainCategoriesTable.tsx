import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Category } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { prepareQueryId, castArrayData } from '@/utils/supabaseHelpers';

interface MainCategoriesTableProps {
  mainCategories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  refreshCategories: () => void;
}

export const MainCategoriesTable: React.FC<MainCategoriesTableProps> = ({
  mainCategories,
  onEdit,
  onDelete,
  refreshCategories,
}) => {
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (category: Category) => {
    setDeleteError(null);
    
    try {
      // Check if the main category has subcategories
      const { data: subcategories, error: subcategoriesError } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', prepareQueryId(category.id))
        .limit(1);

      if (subcategoriesError) throw subcategoriesError;

      if (subcategories && subcategories.length > 0) {
        setDeleteError(`Cannot delete category "${category.name}" because it has subcategories. Please delete or reassign these subcategories first.`);
        toast.error('Cannot delete category with subcategories');
        return;
      }

      // Check if the category has associated products
      const { data: products, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', prepareQueryId(category.id))
        .limit(1);

      if (checkError) throw checkError;

      if (products && products.length > 0) {
        setDeleteError(`Cannot delete category "${category.name}" because it has products associated with it. Please reassign or delete these products first.`);
        toast.error('Cannot delete category with associated products');
        return;
      }

      // Proceed with deletion if no subcategories or products exist
      onDelete(category);
    } catch (error) {
      console.error('Error checking category relations:', error);
      toast.error('Error checking category relations');
    }
  };

  return (
    <div>
      {deleteError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {deleteError}
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mainCategories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                No main categories found
              </TableCell>
            </TableRow>
          ) : (
            mainCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(category)}
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

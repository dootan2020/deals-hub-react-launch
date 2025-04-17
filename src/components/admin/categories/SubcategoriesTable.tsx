
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SubcategoriesTableProps {
  subcategories: Category[];
  mainCategories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  selectedParentId: string | null;
  setSelectedParentId: (id: string | null) => void;
}

export const SubcategoriesTable: React.FC<SubcategoriesTableProps> = ({
  subcategories,
  mainCategories,
  onEdit,
  onDelete,
  selectedParentId,
  setSelectedParentId,
}) => {
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (category: Category) => {
    setDeleteError(null);
    
    try {
      // Check if the subcategory has associated products
      const { data: products, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', category.id)
        .limit(1);

      if (checkError) throw checkError;

      if (products && products.length > 0) {
        setDeleteError(`Cannot delete subcategory "${category.name}" because it has products associated with it. Please reassign or delete these products first.`);
        toast.error('Cannot delete subcategory with associated products');
        return;
      }

      // Proceed with deletion if no products exist
      onDelete(category);
    } catch (error) {
      console.error('Error checking category relations:', error);
      toast.error('Error checking category relations');
    }
  };

  const filteredSubcategories = selectedParentId 
    ? subcategories.filter(subcat => subcat.parent_id === selectedParentId)
    : subcategories;

  return (
    <div>
      {deleteError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {deleteError}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Main Category
        </label>
        <Select 
          value={selectedParentId || undefined} 
          onValueChange={(value) => setSelectedParentId(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Show all subcategories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Main Categories</SelectItem>
            {mainCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Parent Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSubcategories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                {selectedParentId 
                  ? "No subcategories found for this main category" 
                  : "No subcategories found"}
              </TableCell>
            </TableRow>
          ) : (
            filteredSubcategories.map((subcategory) => {
              const parentCategory = mainCategories.find(cat => cat.id === subcategory.parent_id);
              
              return (
                <TableRow key={subcategory.id}>
                  <TableCell className="font-medium">{subcategory.name}</TableCell>
                  <TableCell>{parentCategory?.name || "Unknown"}</TableCell>
                  <TableCell className="max-w-xs truncate">{subcategory.description}</TableCell>
                  <TableCell>{subcategory.slug}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onEdit(subcategory)}
                      >
                        <Edit className="w-4 h-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(subcategory)}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

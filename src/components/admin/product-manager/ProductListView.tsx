import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Product, Category } from '@/types';
import { toast } from 'sonner';
import { Edit, Trash2, Plus, MoreHorizontal } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import ProductFormModal from './ProductFormModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { castArrayData, prepareQueryId } from '@/utils/supabaseHelpers';

export function ProductListView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const productsPerPage = 10;
  
  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);
      
      const { count, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      setTotalProducts(count || 0);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * productsPerPage, page * productsPerPage - 1);
        
      if (error) throw error;
      
      setProducts(castArrayData<Product>(data));
    } catch (error) {
      console.error(error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name');
        
      if (error) throw error;
      
      const categoryMap: Record<string, string> = {};
      castArrayData<Category>(data).forEach(category => {
        if (category && category.id) {
          categoryMap[category.id] = category.name;
        }
      });
      
      setCategories(categoryMap);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load categories');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', prepareQueryId(id));
        
      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete product');
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
    fetchCategories();
  }, [currentPage]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Products</h2>
        <Button onClick={() => { setModalOpen(true); setSelectedProduct(null); }}>
          <Plus className="mr-2" /> Add Product
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">Loading...</TableCell>
            </TableRow>
          ) : (
            products.map(product => (
              <TableRow key={product.id}>
                <TableCell>{product.title}</TableCell>
                <TableCell>{formatCurrency(product.price)}</TableCell>
                <TableCell>{categories[product.category_id] || 'N/A'}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setModalOpen(true); setSelectedProduct(product); }}>
                        <Edit className="mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(product.id)}>
                        <Trash2 className="mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <ProductFormModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        product={selectedProduct} 
        onSuccess={() => {
          fetchProducts(currentPage);
          setModalOpen(false);
        }} 
      />
    </div>
  );
}

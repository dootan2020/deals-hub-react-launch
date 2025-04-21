
import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Category, Product } from '@/types';
import { Edit, Trash2, RefreshCcw, Loader2, Search, Filter } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteProduct } from '@/services/product/productService';

interface ProductWithCategory {
  id: string;
  title: string;
  price: number;
  original_price?: number | null;
  in_stock: boolean;
  category_id: string; // Make this required to match the expected type
  slug: string;
  description: string;
  stock: number;
  last_synced_at?: string;
  category?: Category;
  created_at: string;
}

interface ProductListViewProps {
  onEdit: (product: ProductWithCategory) => void;
  onSync?: (product: ProductWithCategory) => Promise<void>;
  onSyncAll?: () => Promise<void>;
  categories: Category[];
}

export function ProductListView({ 
  onEdit, 
  onSync,
  onSyncAll,
  categories 
}: ProductListViewProps) {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [productToDelete, setProductToDelete] = useState<ProductWithCategory | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [syncingProduct, setSyncingProduct] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const productsWithCategory = data?.map(product => {
        const category = categories.find(c => c.id === product.category_id);
        return {
          ...product,
          category,
          category_id: product.category_id || '' // Ensure category_id is always defined
        };
      }) || [];

      setProducts(productsWithCategory);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [categories]);

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProduct(productToDelete.id);
      setProducts(products.filter(p => p.id !== productToDelete.id));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setProductToDelete(null);
    }
  };

  const handleSyncProduct = async (product: ProductWithCategory) => {
    if (onSync) {
      setSyncingProduct(product.id);
      try {
        await onSync(product);
        toast.success(`Sync completed for ${product.title}`);
        await loadProducts(); // Refresh data
      } catch (error) {
        console.error('Sync error:', error);
        toast.error(`Failed to sync ${product.title}`);
      } finally {
        setSyncingProduct(null);
      }
    }
  };

  const handleSyncAll = async () => {
    if (onSyncAll) {
      setSyncingAll(true);
      try {
        await onSyncAll();
        toast.success('All products synced successfully');
        await loadProducts(); // Refresh data
      } catch (error) {
        console.error('Sync all error:', error);
        toast.error('Failed to sync all products');
      } finally {
        setSyncingAll(false);
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery 
      ? product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.slug.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesCategory = categoryFilter 
      ? product.category_id === categoryFilter 
      : true;
      
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setCategoryFilter('')}
                className={!categoryFilter ? 'bg-accent/50' : ''}
              >
                All Categories
              </DropdownMenuItem>
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category.id}
                  onClick={() => setCategoryFilter(category.id)}
                  className={categoryFilter === category.id ? 'bg-accent/50' : ''}
                >
                  {category.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            onClick={loadProducts}
            variant="outline"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            <span className="ml-2">Refresh</span>
          </Button>
          
          {onSyncAll && (
            <Button
              onClick={handleSyncAll}
              variant="secondary"
              disabled={syncingAll}
            >
              {syncingAll ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
              Sync All Products
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>{product.category?.name || 'Uncategorized'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{product.price.toLocaleString()} VND</span>
                        {product.original_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            {product.original_price.toLocaleString()} VND
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell className="text-center">
                      {product.in_stock ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">In Stock</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Out of Stock</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.last_synced_at ? (
                        <span className="text-xs text-muted-foreground">
                          {new Date(product.last_synced_at).toLocaleDateString()}
                          <br />
                          {new Date(product.last_synced_at).toLocaleTimeString()}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Never</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setProductToDelete(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        {onSync && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSyncProduct(product)}
                            disabled={syncingProduct === product.id}
                          >
                            {syncingProduct === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCcw className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex justify-center items-center p-8 text-muted-foreground">
              No products found
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog 
        open={productToDelete !== null} 
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product &quot;{productToDelete?.title}&quot; and all its data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProduct}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

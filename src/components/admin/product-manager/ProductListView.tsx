
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, RefreshCw, PencilIcon, TrashIcon, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Category } from '@/types';
import { isDataResponse, isSupabaseRecord, isValidRecord, safeNumber, safeString } from '@/utils/supabaseHelpers';

interface Product {
  id: string;
  title: string;
  price: number;
  stock: number;
  in_stock: boolean;
  category_id: string;
  api_stock?: number | null;
  api_price?: number | null;
  last_synced_at?: string | null;
  kiosk_token?: string | null;
}

interface ProductListViewProps {
  onEdit: (product: Product) => void;
  onSync: (product: Product) => void;
  onSyncAll: () => void;
  categories: Category[];
}

export function ProductListView({ 
  onEdit, 
  onSync,
  onSyncAll, 
  categories 
}: ProductListViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncingProduct, setSyncingProduct] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, searchQuery]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (categoryFilter !== 'all') {
        query = query.eq('category_id', categoryFilter);
      }
      
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      const typedProducts: Product[] = [];
      
      if (data) {
        data.forEach(item => {
          if (isSupabaseRecord<Product>(item)) {
            typedProducts.push({
              id: safeString(item.id),
              title: safeString(item.title),
              price: safeNumber(item.price),
              stock: safeNumber(item.stock),
              in_stock: !!item.in_stock,
              category_id: safeString(item.category_id),
              api_stock: item.api_stock !== undefined ? safeNumber(item.api_stock) : null,
              api_price: item.api_price !== undefined ? safeNumber(item.api_price) : null,
              last_synced_at: item.last_synced_at ? safeString(item.last_synced_at) : null,
              kiosk_token: item.kiosk_token ? safeString(item.kiosk_token) : null
            });
          }
        });
      }
      
      setProducts(typedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncClick = async (product: Product) => {
    setSyncingProduct(product.id);
    try {
      await onSync(product);
      await fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error syncing product:', error);
    } finally {
      setSyncingProduct(null);
    }
  };
  
  const handleSyncAllClick = async () => {
    setIsSyncingAll(true);
    try {
      await onSyncAll();
      await fetchProducts(); // Refresh the list after sync
      toast.success('All products have been synchronized');
    } catch (error) {
      console.error('Error syncing all products:', error);
      toast.error('Failed to sync all products');
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Product deleted successfully');
      await fetchProducts(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(`Failed to delete product: ${error.message}`);
    }
  };

  const getCategoryNameById = (id: string) => {
    const category = categories.find(cat => cat.id === id);
    return category ? category.name : 'Unknown';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select 
            value={categoryFilter} 
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2 flex-shrink-0">
          <Button 
            variant="outline"
            onClick={fetchProducts}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button
            variant="secondary"
            onClick={handleSyncAllClick}
            disabled={isSyncingAll || isLoading || products.filter(p => p.kiosk_token).length === 0}
          >
            {isSyncingAll && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {!isSyncingAll && <RefreshCw className="h-4 w-4 mr-2" />}
            Sync All Products
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage your product listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No products found. Create your first product to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">API Stock</TableHead>
                    <TableHead className="text-right">Last Synced</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium max-w-[250px] truncate">
                        {product.title}
                      </TableCell>
                      <TableCell>
                        {getCategoryNameById(product.category_id)}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.price.toLocaleString()} VND
                      </TableCell>
                      <TableCell className="text-right">
                        {product.stock}
                      </TableCell>
                      <TableCell className="text-center">
                        {product.in_stock ? (
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                            In Stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                            Out of Stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.api_stock !== null ? product.api_stock : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.last_synced_at ? (
                          new Date(product.last_synced_at).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        ) : (
                          'Never'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {product.kiosk_token && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSyncClick(product)}
                              disabled={syncingProduct === product.id}
                              className="h-8 px-2 text-blue-600"
                            >
                              {syncingProduct === product.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <RefreshCw className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(product)}
                            className="h-8 px-2"
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, ExternalLink, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useProductSync } from '@/hooks/use-product-sync';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  price: number;
  external_id: string | null;
  in_stock: boolean;
  api_stock: number | null;
  last_synced_at: string | null;
  slug: string;
}

const ProductsAdmin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { syncProduct } = useProductSync();

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, price, external_id, in_stock, api_stock, last_synced_at, slug')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSyncProduct = async (externalId: string) => {
    if (!externalId) {
      toast.error('Product has no external ID to sync');
      return;
    }

    try {
      await syncProduct(externalId);
      toast.success('Product sync initiated');
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error syncing product:', error);
      toast.error('Failed to sync product');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <AdminLayout title="Products Management">
      <div className="flex justify-between mb-6">
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Link>
        </Button>
        <Button variant="outline" onClick={fetchProducts}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>External ID</TableHead>
              <TableHead>Last Synced</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-medium">{product.title}</div>
                  </TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className={product.in_stock ? 'text-green-600' : 'text-red-600'}>
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                      {product.api_stock !== null && ` (${product.api_stock})`}
                    </div>
                  </TableCell>
                  <TableCell>{product.external_id || '—'}</TableCell>
                  <TableCell>{formatDate(product.last_synced_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        asChild
                      >
                        <Link to={`/product/${product.slug}`} target="_blank">
                          <ExternalLink className="w-4 h-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        asChild
                      >
                        <Link to={`/admin/products/edit/${product.id}`}>
                          <Edit className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      {product.external_id && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSyncProduct(product.external_id!)}
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span className="sr-only">Sync</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default ProductsAdmin;

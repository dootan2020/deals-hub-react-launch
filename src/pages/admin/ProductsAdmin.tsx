
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { useProductSync } from '@/hooks/use-product-sync';
import { RefreshCw, PlusCircle, ExternalLink, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ProductsAdmin = () => {
  const navigate = useNavigate();
  const { 
    products, 
    isLoading, 
    syncAllProducts,
    syncProduct
  } = useProductSync();

  return (
    <AdminLayout title="Products">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products ({products.length})</h1>
          <p className="text-muted-foreground mt-1">
            Manage digital products and their availability
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={() => navigate('/admin/products/new')}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Product
          </Button>
          <Button
            variant="outline"
            onClick={() => syncAllProducts()}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Sync All
          </Button>
        </div>
      </div>

      <Card className="mb-6 bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-medium mb-2">API Integration</h2>
              <p className="text-muted-foreground">
                Products are synchronized with the TapHoaMMO API using Kiosk Tokens. Use the "Sync All" button to update product stocks and prices.
              </p>
              <p className="text-muted-foreground mt-2 text-sm flex items-center gap-1">
                <ExternalLink className="w-4 h-4" /> 
                Make sure to set up API configurations with user tokens in the API Config page first.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <Info className="h-5 w-5 text-blue-500" />
        <AlertDescription className="text-blue-700">
          <p className="font-medium">API Proxy Update</p>
          <p className="mt-1">We've updated the product creation process to use a more reliable API connection method. Use the "New Product" button to create products with automatic data retrieval.</p>
        </AlertDescription>
      </Alert>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="uppercase bg-gray-50 text-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Price</th>
                <th scope="col" className="px-6 py-3">Stock</th>
                <th scope="col" className="px-6 py-3">Category</th>
                <th scope="col" className="px-6 py-3">Last Synced</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{product.title}</td>
                  <td className="px-6 py-4">{Intl.NumberFormat('vi-VN').format(product.price)} VND</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.categories?.name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    {product.last_synced_at ? new Date(product.last_synced_at).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                    >
                      Edit
                    </Button>
                    {product.external_id && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => syncProduct(product.external_id)}
                        disabled={isLoading}
                      >
                        <RefreshCw className={`mr-1 h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                        Sync
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {products.length === 0 && !isLoading && (
                <tr className="border-b">
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No products found. Click "New Product" to create one.
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr className="border-b">
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Loading products...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductsAdmin;

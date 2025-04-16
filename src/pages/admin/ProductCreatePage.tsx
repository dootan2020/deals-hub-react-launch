
import AdminLayout from '@/components/layout/AdminLayout';
import { ProductForm } from '@/components/admin/ProductForm';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ProductCreatePage = () => {
  return (
    <AdminLayout title="Add New Product">
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-medium mb-2">Adding a new product</h2>
              <p className="text-muted-foreground">
                Enter a Kiosk Token (e.g., WK76IVBVK3X0WW9DKZ4R) to automatically retrieve product information from TapHoaMMO API, or manually fill in the product details below.
              </p>
              <p className="text-muted-foreground mt-2 text-sm flex items-center gap-1">
                <ExternalLink className="w-4 h-4" /> 
                Make sure to set up API configurations with user tokens in the API Config page first.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Alert variant="default" className="mb-6 bg-amber-50 border-amber-200">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <AlertDescription className="text-amber-700">
          <p className="font-medium">API Connection Notes</p>
          <p className="mt-1">Our system uses CORS proxies to fetch product data. If you encounter any issues with HTML responses, try switching to a different proxy in the dropdown menu.</p>
        </AlertDescription>  
      </Alert>
      
      <ProductForm />
    </AdminLayout>
  );
};

export default ProductCreatePage;

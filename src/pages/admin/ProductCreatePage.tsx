
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
                Enter a Kiosk Token (e.g., KH5ZB5QB8G1L7J7S4DGW) to automatically retrieve product information, or manually fill in the product details below.
              </p>
              <p className="text-muted-foreground mt-2 text-sm flex items-center gap-1">
                <ExternalLink className="w-4 h-4" /> 
                Make sure to set up API configurations with user tokens in the API Config page first.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Alert variant="destructive" className="mb-6 bg-amber-50 border-amber-200">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <AlertDescription className="text-amber-700">
          <p className="font-medium">API Connection Issue</p>
          <p className="mt-1">Currently, the TapHoaMMO API is returning HTML responses instead of JSON. The system will provide mock product data for demonstration purposes until the API connectivity issue is resolved.</p>
        </AlertDescription>  
      </Alert>
      
      <ProductForm />
    </AdminLayout>
  );
};

export default ProductCreatePage;

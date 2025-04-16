
import AdminLayout from '@/components/layout/AdminLayout';
import { ProductForm } from '@/components/admin/ProductForm';

const ProductCreatePage = () => {
  return (
    <AdminLayout title="Add New Product">
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Adding a new product</h2>
        <p className="text-muted-foreground">
          Enter a Kiosk Token to automatically retrieve product information, or manually fill in the product details below.
        </p>
      </div>
      <ProductForm />
    </AdminLayout>
  );
};

export default ProductCreatePage;

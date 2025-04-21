
import AdminLayout from '@/components/layout/AdminLayout';
import ProductFormComponent from '@/components/admin/product-tester/ProductForm';
import ProxyTester from '@/components/admin/product-tester/ProxyTester';

const ProductFormWithTester = () => {
  return (
    <AdminLayout title="Create Product with Tester">
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Create Product with Tester</h1>
        <ProductFormComponent />
        <ProxyTester />
      </div>
    </AdminLayout>
  );
};

export default ProductFormWithTester;


import AdminLayout from '@/components/layout/AdminLayout';
import { ProductForm } from '@/components/admin/ProductForm';

const ProductCreatePage = () => {
  return (
    <AdminLayout title="Add New Product">
      <ProductForm />
    </AdminLayout>
  );
};

export default ProductCreatePage;

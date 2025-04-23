
import React from 'react';
// Đã xoá useProductForm và các thành phần product-form không còn phù hợp
// import { useProductForm } from './product-form/useProductForm';
// import { Form } from '@/components/ui/form';
// import { ProductFormFields } from './product-form/ProductFormFields';
// import { ProductFormHeader } from './product-form/ProductFormHeader';
// import { ProductFormActions } from './product-form/ProductFormActions';

interface ProductFormProps {
  productId?: string;
  onSuccess?: () => void;
}

// Tạm thời render thông báo hoặc ẩn hoàn toàn thành phần này
export function ProductForm({ productId, onSuccess }: ProductFormProps) {
  return (
    <div className="p-6 text-center text-muted-foreground">
      <p>Chức năng quản lý sản phẩm đang được nâng cấp. Vui lòng quay lại sau.</p>
    </div>
  );
}

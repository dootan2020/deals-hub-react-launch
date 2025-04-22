
import React from 'react';
import { useProductForm } from './product-form/useProductForm';
import { Form } from '@/components/ui/form';
import { ProductFormFields } from './product-form/ProductFormFields';
import { ProductFormHeader } from './product-form/ProductFormHeader';
import { ProductFormActions } from './product-form/ProductFormActions';

interface ProductFormProps {
  productId?: string;
  onSuccess?: () => void;
}

export function ProductForm({ productId, onSuccess }: ProductFormProps) {
  const {
    form,
    categories,
    isLoading,
    formDirty,
    showResetDialog,
    setShowResetDialog,
    resetForm,
    onSubmit,
    handleApiDataReceived
  } = useProductForm(productId, onSuccess);

  return (
    <>
      <ProductFormHeader 
        onApiDataReceived={handleApiDataReceived} 
        initialKioskToken={form.getValues('kioskToken')}
      />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <ProductFormFields 
            categories={categories} 
            isEditMode={!!productId}
          />

          <ProductFormActions 
            isLoading={isLoading}
            productId={productId}
            onReset={resetForm}
            formDirty={formDirty}
            showResetDialog={showResetDialog}
            setShowResetDialog={setShowResetDialog}
          />
        </form>
      </Form>
    </>
  );
}

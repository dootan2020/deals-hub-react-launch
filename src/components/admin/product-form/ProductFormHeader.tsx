
import React from 'react';
import ApiProductTester from '@/components/admin/product-manager/ApiProductTester';
import { ApiResponse } from '@/utils/apiUtils';

interface ProductFormHeaderProps {
  onApiDataReceived: (data: ApiResponse) => void;
  initialKioskToken?: string;
}

export function ProductFormHeader({ onApiDataReceived, initialKioskToken }: ProductFormHeaderProps) {
  return (
    <ApiProductTester 
      onApiDataReceived={onApiDataReceived} 
      initialKioskToken={initialKioskToken}
    />
  );
}

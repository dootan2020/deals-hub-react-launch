
import React from 'react';
import { ApiProductTester, ApiResponse } from '@/components/admin/product-manager/ApiProductTester';

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

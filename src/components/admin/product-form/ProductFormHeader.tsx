
import React from 'react';
import { ApiTester } from '../product-manager/ApiTester';
import { ApiResponse } from '@/utils/apiUtils';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ProductFormHeaderProps {
  onApiDataReceived?: (data: ApiResponse) => void;
  initialKioskToken?: string;
}

export function ProductFormHeader({ onApiDataReceived, initialKioskToken = '' }: ProductFormHeaderProps) {
  return (
    <div className="mb-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Product Data</CardTitle>
          <CardDescription>
            Enter a Kiosk Token to automatically retrieve product information from the API, or manually fill in the details.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="mt-4">
        <ApiTester 
          initialKioskToken={initialKioskToken}
          onApiDataReceived={onApiDataReceived}
        />
      </div>
    </div>
  );
}

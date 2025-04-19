
import React from 'react';
import { Button } from '@/components/ui/button';

interface SubcategoryErrorProps {
  error: string;
}

const SubcategoryError: React.FC<SubcategoryErrorProps> = ({ error }) => {
  return (
    <div className="container py-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-500">Error</h2>
        <p className="mt-4">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-6"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default SubcategoryError;

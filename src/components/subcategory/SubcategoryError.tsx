
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

interface SubcategoryErrorProps {
  error: string | null;
}

const SubcategoryError: React.FC<SubcategoryErrorProps> = ({ error }) => {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md w-full text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Products</h2>
        <p className="text-red-600 mb-6">{error || "There was a problem loading the subcategory products."}</p>
        <div className="space-x-4">
          <Button asChild variant="outline">
            <Link to="/">Return to Home</Link>
          </Button>
          <Button asChild>
            <Link to="/products">Browse All Products</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubcategoryError;

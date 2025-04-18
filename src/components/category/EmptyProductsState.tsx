
import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface EmptyProductsStateProps {
  message?: string;
}

const EmptyProductsState: React.FC<EmptyProductsStateProps> = ({ 
  message = "No products found matching your criteria."
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <ShoppingBag className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">No Products Found</h2>
      <p className="text-gray-600 max-w-md mb-6">{message}</p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button asChild variant="default">
          <Link to="/">
            Return Home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/category/email-accounts">
            Browse Email Accounts
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default EmptyProductsState;

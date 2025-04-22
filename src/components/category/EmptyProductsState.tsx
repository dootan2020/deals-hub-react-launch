
import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyProductsStateProps {
  message?: string;
}

const EmptyProductsState: React.FC<EmptyProductsStateProps> = ({ 
  message = "No products found matching your criteria."
}) => {
  return (
    <Card className="max-w-2xl mx-auto my-12">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <ShoppingBag className="h-12 w-12 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">
          No Products Found
        </h2>
        
        <p className="text-muted-foreground max-w-md mb-6">
          {message}
        </p>
        
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
      </CardContent>
    </Card>
  );
};

export default EmptyProductsState;

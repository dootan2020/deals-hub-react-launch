
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormFooterProps {
  isLoading: boolean;
  productId?: string;
}

export function FormFooter({ isLoading, productId }: FormFooterProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-end space-x-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => navigate('/admin/products')}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading} className="min-w-[120px]">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {productId ? 'Updating...' : 'Creating...'}
          </>
        ) : (
          productId ? 'Update Product' : 'Create Product'
        )}
      </Button>
    </div>
  );
}

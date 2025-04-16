
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
      </Button>
    </div>
  );
}

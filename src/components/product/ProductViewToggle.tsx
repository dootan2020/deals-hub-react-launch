
import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid2X2, List } from 'lucide-react';

interface ProductViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export const ProductViewToggle: React.FC<ProductViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant={view === 'grid' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className="w-8 h-8 p-0"
      >
        <Grid2X2 className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('list')}
        className="w-8 h-8 p-0"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProductViewToggle;

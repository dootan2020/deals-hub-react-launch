
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Product } from '@/types';
import ProductQuickView from '../ProductQuickView';

interface ProductQuickViewDialogProps {
  product: Product;
}

const ProductQuickViewDialog = ({ product }: ProductQuickViewDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Eye className="h-4 w-4 mr-2" /> Quick View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <ProductQuickView product={product} />
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickViewDialog;

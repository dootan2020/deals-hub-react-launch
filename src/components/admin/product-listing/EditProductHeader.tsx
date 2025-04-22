
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export function EditProductHeader() {
  return (
    <DialogHeader>
      <DialogTitle>Edit Product</DialogTitle>
      <DialogDescription>
        Make changes to the product information below.
      </DialogDescription>
    </DialogHeader>
  );
}

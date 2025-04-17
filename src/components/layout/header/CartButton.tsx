
import { ShoppingCart } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface CartButtonProps {
  cartItemsCount: number;
}

const CartButton = ({ cartItemsCount }: CartButtonProps) => {
  const handleAddToCart = () => {
    toast.success("Added to cart!");
  };

  return (
    <button 
      onClick={handleAddToCart} 
      className="p-1 text-text-light hover:text-primary transition-colors relative"
      aria-label={`Cart with ${cartItemsCount} items`}
    >
      <ShoppingCart className="h-6 w-6" />
      {cartItemsCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          {cartItemsCount}
        </span>
      )}
    </button>
  );
};

export default CartButton;

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { 
  isDataResponse, 
  toFilterableUUID,
  safeNumber, 
  uuidFilter
} from '@/utils/supabaseHelpers';

interface PurchaseConfirmDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  productId: string;
  quantity: number;
  onPurchaseSuccess: () => void;
}

export function PurchaseConfirmDialog({ 
  isOpen, 
  setIsOpen, 
  productId, 
  quantity, 
  onPurchaseSuccess 
}: PurchaseConfirmDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [productPrice, setProductPrice] = useState<number>(0);
  const [userBalance, setUserBalance] = useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;
      setIsLoading(true);
      try {
        const price = await fetchProductPrice();
        setProductPrice(price);
        
        const balance = await checkUserBalance();
        setUserBalance(balance);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isOpen, user?.id, productId]);

  const fetchProductPrice = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('price')
        .eq('id', toFilterableUUID(productId))
        .single();

      if (error) throw error;
      
      if (isDataResponse({ data, error }) && data.price !== undefined) {
        return safeNumber(data.price);
      }

      return 0;
    } catch (error) {
      console.error('Error fetching product price:', error);
      return 0;
    }
  };

  const checkUserBalance = async () => {
    if (!user) return 0;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', toFilterableUUID(user.id))
        .single();
      
      if (error) throw error;
      
      if (isDataResponse({ data, error }) && data.balance !== undefined) {
        const balance = typeof data.balance === 'number' ? data.balance : parseFloat(data.balance);
        return isNaN(balance) ? 0 : balance;
      }
      
      return 0;
    } catch (error) {
      console.error('Error fetching user balance:', error);
      return 0;
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error('You must be logged in to make a purchase.');
      return;
    }

    if (userBalance < productPrice * quantity) {
      toast.error('Insufficient balance. Please deposit funds.');
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      setUserBalance(prevBalance => prevBalance - productPrice * quantity);

      const { data, error } = await supabase.functions.invoke('purchase-product', {
        body: {
          productId: productId,
          quantity: quantity,
          userId: user.id
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        toast.success('Purchase successful!');
        onPurchaseSuccess();
      } else {
        throw new Error(data?.message || 'Purchase failed');
      }
    } catch (error: any) {
      console.error('Purchase failed:', error);
      toast.error(`Purchase failed: ${error.message}`);
      
      setUserBalance(await checkUserBalance());
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>
            {isLoading ? (
              <>
                Processing...
                <Loader2 className="inline ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                Are you sure you want to purchase {quantity} item(s) for a total of {(productPrice * quantity).toLocaleString()} VND?
                <br />
                Your current balance: {userBalance.toLocaleString()} VND
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="secondary" disabled={isLoading} onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={isLoading || userBalance < productPrice * quantity} onClick={handlePurchase}>
            Confirm Purchase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

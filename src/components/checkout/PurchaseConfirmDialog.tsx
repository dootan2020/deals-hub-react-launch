import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserBalance } from '@/hooks/useUserBalance';

interface PurchaseConfirmDialogProps {
  productId: string;
  productTitle: string;
  productPrice: number;
  onPurchase: (productId: string) => Promise<void>;
}

const PurchaseConfirmDialog: React.FC<PurchaseConfirmDialogProps> = ({
  productId,
  productTitle,
  productPrice,
  onPurchase
}) => {
  const [open, setOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { user } = useAuth();
  const { userBalance } = useUserBalance();
  const navigate = useNavigate();

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      if (!user) {
        toast.error("Bạn cần đăng nhập để mua sản phẩm này.");
        navigate('/login');
        return;
      }

      if (userBalance < productPrice) {
        toast.error("Số dư không đủ", "Vui lòng nạp thêm tiền vào tài khoản.");
        navigate('/account');
        return;
      }

      await onPurchase(productId);
      toast.success("Mua hàng thành công!", `Bạn đã mua thành công ${productTitle}.`);
      setOpen(false);
    } catch (error: any) {
      console.error("Purchase failed:", error);
      toast.error("Lỗi", error.message || "Đã có lỗi xảy ra trong quá trình mua hàng.");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="primary">Mua ngay</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận mua hàng</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn mua sản phẩm <b>{productTitle}</b> với giá <b>{formatCurrency(productPrice)}</b>?
            <br />
            Số dư hiện tại của bạn là <b>{formatCurrency(userBalance || 0)}</b>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPurchasing}>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handlePurchase} disabled={isPurchasing}>
            {isPurchasing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Xác nhận"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PurchaseConfirmDialog;

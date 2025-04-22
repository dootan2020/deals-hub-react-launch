
// Update the import to use named export instead of default
import { PurchaseConfirmDialog } from "@/components/checkout/PurchaseConfirmDialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BuyNowButtonProps {
  productId: string;
  className?: string;
  onPurchaseSuccess?: () => void;
}

export function BuyNowButton({
  productId,
  className,
  onPurchaseSuccess
}: BuyNowButtonProps) {
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);

  const handlePurchaseSuccess = () => {
    if (onPurchaseSuccess) {
      onPurchaseSuccess();
    }
  };

  return (
    <>
      <Button 
        className={className} 
        onClick={() => setIsPurchaseDialogOpen(true)}
      >
        Buy Now
      </Button>
      
      <PurchaseConfirmDialog
        isOpen={isPurchaseDialogOpen}
        setIsOpen={setIsPurchaseDialogOpen}
        productId={productId}
        quantity={1}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </>
  );
}

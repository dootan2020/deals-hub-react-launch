
import React from 'react';
import {
  DialogHeader as BaseDialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

interface DialogHeaderProps {
  isVerifying: boolean;
}

export const DialogHeader = ({ isVerifying }: DialogHeaderProps) => {
  return (
    <BaseDialogHeader className="bg-muted px-6 py-4 -mx-6 -mt-6 border-b border-border">
      <DialogTitle className="text-xl font-semibold text-foreground">
        {isVerifying ? 'Đang xác minh tồn kho...' : 'Xác nhận mua hàng'}
      </DialogTitle>
      <DialogDescription className="text-sm text-muted-foreground mt-1">
        {isVerifying ? 
          'Vui lòng đợi trong khi chúng tôi kiểm tra tồn kho sản phẩm' : 
          'Vui lòng xác nhận thông tin mua hàng của bạn'}
      </DialogDescription>
    </BaseDialogHeader>
  );
};

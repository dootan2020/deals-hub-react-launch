
import React from 'react';
import {
  DialogHeader as BaseDialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

export interface DialogHeaderProps {
  title?: string;
  isVerifying: boolean;
  onClose?: () => void;
}

export const DialogHeader = ({ title, isVerifying, onClose }: DialogHeaderProps) => {
  return (
    <BaseDialogHeader className="bg-muted px-6 py-4 -mx-6 -mt-6 border-b border-border">
      <DialogTitle className="text-xl font-semibold text-foreground">
        {title || (isVerifying ? 'Đang xác minh tồn kho...' : 'Xác nhận mua hàng')}
      </DialogTitle>
      <DialogDescription className="text-sm text-muted-foreground mt-1">
        {isVerifying ? 
          'Vui lòng đợi trong khi chúng tôi kiểm tra tồn kho sản phẩm' : 
          'Vui lòng xác nhận thông tin mua hàng của bạn'}
      </DialogDescription>
    </BaseDialogHeader>
  );
};

export default DialogHeader;

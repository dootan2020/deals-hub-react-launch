
import { useState } from 'react';
import { toast } from 'sonner';

type PurchaseStatus = 'idle' | 'loading' | 'success' | 'error';

export const usePurchaseToast = () => {
  const [status, setStatus] = useState<PurchaseStatus>('idle');

  const notifyLoading = () => {
    setStatus('loading');
    toast.loading('Đang xử lý giao dịch...', {
      id: 'purchase-toast',
    });
  };

  const notifySuccess = (title: string, message: string) => {
    setStatus('success');
    toast.success(title, {
      id: 'purchase-toast',
      description: message,
    });
  };

  const notifyError = (title: string, message: string) => {
    setStatus('error');
    toast.error(title, {
      id: 'purchase-toast',
      description: message,
    });
  };

  const handleApiError = (error: any, defaultMessage: string) => {
    console.error('API Error:', error);
    
    let errorMessage = defaultMessage;
    
    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    notifyError('Lỗi', errorMessage);
  };

  return {
    status,
    setStatus,
    notifyLoading,
    notifySuccess,
    notifyError,
    handleApiError,
  };
};

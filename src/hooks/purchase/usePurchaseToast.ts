
import { useState } from 'react';
import { toast } from 'sonner';

type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error';

export const usePurchaseToast = () => {
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  
  const notifyLoading = () => {
    setStatus('loading');
    toast.loading('Đang xử lý giao dịch...', {
      id: 'purchase-toast',
      duration: Infinity
    });
  };
  
  const notifySuccess = (title: string, message?: string) => {
    setStatus('success');
    toast.success(title, {
      id: 'purchase-toast',
      description: message
    });
  };
  
  const notifyError = (title: string, message?: string) => {
    setStatus('error');
    toast.error(title, {
      id: 'purchase-toast',
      description: message
    });
  };
  
  const handleApiError = (error: any, defaultMessage = 'Đã xảy ra lỗi') => {
    console.error('API Error:', error);
    const errorMessage = error?.message || defaultMessage;
    notifyError('Giao dịch thất bại', errorMessage);
  };
  
  return {
    status,
    setStatus,
    notifyLoading,
    notifySuccess,
    notifyError,
    handleApiError
  };
};

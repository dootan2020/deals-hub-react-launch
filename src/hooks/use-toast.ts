
import { toast as sonnerToast } from 'sonner';

// Simple, defined toast interface
export interface ToastFunction {
  (message: string): void;
}

export interface Toast {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  loading: (message: string) => string | number;
  dismiss: (id?: string) => void;
}

export const toast: Toast = {
  success: (title: string, message?: string) => {
    sonnerToast.success(title, { description: message });
  },
  error: (title: string, message?: string) => {
    sonnerToast.error(title, { description: message });
  },
  warning: (title: string, message?: string) => {
    sonnerToast.warning(title, { description: message });
  },
  info: (title: string, message?: string) => {
    sonnerToast.info(title, { description: message });
  },
  loading: (message: string) => {
    return sonnerToast.loading(message);
  },
  dismiss: (id?: string) => {
    if (id) {
      sonnerToast.dismiss(id);
    } else {
      sonnerToast.dismiss();
    }
  }
};

// Export a useToast hook for components that need it
export const useToast = () => {
  return { toast };
};

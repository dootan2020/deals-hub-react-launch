
import { toast as sonnerToast } from "sonner";

export type ToastFunction = typeof sonnerToast;

export interface Toast {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

export const useToast = () => {
  const toast = (props: Toast) => {
    if (props.variant === 'destructive') {
      return sonnerToast.error(props.title, { description: props.description, duration: props.duration });
    } else if (props.variant === 'success') {
      return sonnerToast.success(props.title, { description: props.description, duration: props.duration });
    } else {
      return sonnerToast.info(props.title, { description: props.description, duration: props.duration });
    }
  };

  // Add convenience methods
  toast.error = (title: string, description?: string) => {
    return sonnerToast.error(title, { description, duration: 5000 });
  };

  toast.success = (title: string, description?: string) => {
    return sonnerToast.success(title, { description, duration: 3000 });
  };

  toast.info = (title: string, description?: string) => {
    return sonnerToast.info(title, { description, duration: 3000 });
  };

  toast.warning = (title: string, description?: string) => {
    return sonnerToast.warning(title, { description, duration: 5000 });
  };

  return { toast };
};

// Export a singleton instance for direct imports
export const toast = {
  error: (title: string, description?: string) => {
    return sonnerToast.error(title, { description, duration: 5000 });
  },
  success: (title: string, description?: string) => {
    return sonnerToast.success(title, { description, duration: 3000 });
  },
  info: (title: string, description?: string) => {
    return sonnerToast.info(title, { description, duration: 3000 });
  },
  warning: (title: string, description?: string) => {
    return sonnerToast.warning(title, { description, duration: 5000 });
  }
};

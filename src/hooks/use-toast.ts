
import { ReactNode } from "react";
import { toast as sonnerToast, type Toast as SonnerToast, type ExternalToast } from "sonner";
import { useToast as useShadcnToast } from "@/components/ui/toast";

// Re-export the original useToast hook
export const useToast = useShadcnToast;

// Define toast function types that match what we need
export interface Toast {
  title?: ReactNode;
  description?: ReactNode;
  variant?: "default" | "destructive" | "success" | "warning";
}

export interface ToastFunction {
  (props: Toast): string | number;
  (title: ReactNode, description?: ReactNode): string | number;
  success: (title: ReactNode, description?: ReactNode) => string | number;
  error: (title: ReactNode, description?: ReactNode) => string | number;
  warning: (title: ReactNode, description?: ReactNode) => string | number;
  info: (title: ReactNode, description?: ReactNode) => string | number;
  loading: (title: ReactNode, description?: ReactNode) => string | number;
  dismiss: (toastId?: string | number) => void;
  promise: <T>(
    promise: Promise<T>,
    msgs: {
      loading: ReactNode;
      success: ReactNode;
      error: ReactNode;
    },
    opts?: ExternalToast
  ) => Promise<T>;
}

// Create the toast function
const createToast = (): ToastFunction => {
  // Create the base function with both overload signatures
  const toastFn = ((titleOrOptions: any, description?: ReactNode) => {
    if (typeof titleOrOptions === 'object' && titleOrOptions !== null && 'title' in titleOrOptions) {
      // Handle object format with variant property
      const { title, description, variant } = titleOrOptions;
      
      if (variant === 'destructive') {
        return sonnerToast.error(title, { description });
      } else if (variant === 'success') {
        return sonnerToast.success(title, { description });
      } else if (variant === 'warning') {
        return sonnerToast.warning(title, { description });
      } else {
        return sonnerToast(title, { description });
      }
    } else {
      // Handle title, description format
      return sonnerToast(titleOrOptions, { description });
    }
  }) as ToastFunction;

  // Add all the required methods
  toastFn.success = (title: ReactNode, description?: ReactNode) => {
    return sonnerToast.success(title, { description });
  };

  toastFn.error = (title: ReactNode, description?: ReactNode) => {
    return sonnerToast.error(title, { description });
  };

  toastFn.warning = (title: ReactNode, description?: ReactNode) => {
    return sonnerToast.warning(title, { description });
  };

  toastFn.info = (title: ReactNode, description?: ReactNode) => {
    return sonnerToast(title, { description });
  };

  toastFn.loading = (title: ReactNode, description?: ReactNode) => {
    return sonnerToast.loading(title, { description });
  };

  toastFn.dismiss = (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  };

  // Fix promise return type to correctly return the promise
  toastFn.promise = <T>(
    promise: Promise<T>,
    msgs: {
      loading: ReactNode;
      success: ReactNode;
      error: ReactNode;
    },
    opts?: ExternalToast
  ) => {
    sonnerToast.promise(promise, {
      loading: msgs.loading,
      success: msgs.success,
      error: msgs.error,
      ...opts
    });
    return promise;
  };

  return toastFn;
};

// Export the single toast instance
export const toast = createToast();

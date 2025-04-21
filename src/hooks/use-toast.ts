
import React, { ReactNode } from "react";
import { toast as sonnerToast, type ExternalToast } from "sonner";

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
    if (typeof titleOrOptions === 'object' && titleOrOptions !== null && !React.isValidElement(titleOrOptions)) {
      // Handle object format with variant property
      const { title, description, variant } = titleOrOptions as Toast;
      
      if (variant === 'destructive') {
        return sonnerToast.error(title as ReactNode, { description });
      } else if (variant === 'success') {
        return sonnerToast.success(title as ReactNode, { description });
      } else if (variant === 'warning') {
        return sonnerToast.warning(title as ReactNode, { description });
      } else {
        return sonnerToast(title as ReactNode, { description });
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

  toastFn.promise = <T>(
    promise: Promise<T>,
    msgs: {
      loading: ReactNode;
      success: ReactNode;
      error: ReactNode;
    },
    opts?: ExternalToast
  ): Promise<T> => {
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

// Create and export the single toast instance and hook
export const toast = createToast();

// Create a hook that's compatible with the shadcn pattern
export const useToast = () => {
  return {
    toast,
    // Add a dummy "toasts" array to be compatible with shadcn/ui toast usage
    toasts: []
  };
};


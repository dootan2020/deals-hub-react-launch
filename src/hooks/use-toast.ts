
import { ReactNode } from "react";
import { toast as sonnerToast, type ToastT, type ExternalToast } from "sonner";
import { useToast as useShadcnToast } from "@/components/ui/toast";

// Re-export the original useToast hook
export const useToast = useShadcnToast;

// Define the toast function type
export type ToastFunction = {
  (props: { title?: ReactNode; description?: ReactNode; variant?: "default" | "destructive" | "success" | "warning" }): void;
  (title: ReactNode, description?: ReactNode): void;
  success(title: ReactNode, description?: ReactNode): void;
  error(title: ReactNode, description?: ReactNode): void;
  warning(title: ReactNode, description?: ReactNode): void;
  info(title: ReactNode, description?: ReactNode): void;
  loading(title: ReactNode, description?: ReactNode): string | number;
  dismiss(toastId?: string | number): void;
  promise<T>(
    promise: Promise<T>,
    msgs: {
      loading: ReactNode;
      success: ReactNode;
      error: ReactNode;
    },
    opts?: ExternalToast
  ): Promise<T>;
};

// Create the toast function
const createToast = (): ToastFunction => {
  // Create the base function that can accept both formats
  const toastFn = ((titleOrOptions: any, description?: ReactNode) => {
    if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
      // This is the object format: { title, description, variant }
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
      // This is the title, description format
      return sonnerToast(titleOrOptions, { description });
    }
  }) as ToastFunction;

  // Add methods
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

  toastFn.promise = (promise, msgs, opts) => {
    return sonnerToast.promise(promise, {
      loading: msgs.loading,
      success: msgs.success,
      error: msgs.error,
      ...opts
    }) as Promise<any>;
  };

  return toastFn;
};

// Export the single toast instance
export const toast = createToast();

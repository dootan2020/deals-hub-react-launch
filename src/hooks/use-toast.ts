
import { toast as sonnerToast, type ToastT, type ToastToDismiss, type ExternalToast } from "sonner";
import { useToast as useShadcnToast } from "@/components/ui/toast";
import { ReactNode } from "react";

// Re-export the original useToast hook
export const useToast = useShadcnToast;

// Define the toast function type
export type ToastFunction = {
  (message: ReactNode, data?: ExternalToast): string | number;
  success(message: ReactNode, data?: ExternalToast): string | number;
  error(message: ReactNode, data?: ExternalToast): string | number;
  warning(message: ReactNode, data?: ExternalToast): string | number;
  info(message: ReactNode, data?: ExternalToast): string | number;
  loading(message: ReactNode, data?: ExternalToast): string | number;
  dismiss(toastId?: string | number): void;
  // Include other methods from sonnerToast
  getHistory(): (ToastT | ToastToDismiss)[];
  update(id: string | number, data: ExternalToast): void;
  promise<T>(
    promise: Promise<T>,
    msgs: {
      loading: ReactNode;
      success: ReactNode;
      error: ReactNode;
    },
    data?: ExternalToast
  ): Promise<T>;
};

// Create the toast function
const createToast = () => {
  // Create base toast function
  const toastFn = (message: ReactNode, data?: ExternalToast) => {
    return sonnerToast(message, data);
  };

  // Add success method
  toastFn.success = (message: ReactNode, data?: ExternalToast) => {
    return sonnerToast.success(message, data);
  };

  // Add error method
  toastFn.error = (message: ReactNode, data?: ExternalToast) => {
    return sonnerToast.error(message, data);
  };

  // Add warning method
  toastFn.warning = (message: ReactNode, data?: ExternalToast) => {
    return sonnerToast.warning(message, data);
  };

  // Add info method
  toastFn.info = (message: ReactNode, data?: ExternalToast) => {
    return sonnerToast.info(message, data);
  };

  // Add loading method
  toastFn.loading = (message: ReactNode, data?: ExternalToast) => {
    return sonnerToast.loading(message, data);
  };

  // Add dismiss method
  toastFn.dismiss = (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  };

  // Add other methods
  toastFn.getHistory = sonnerToast.getHistory;
  toastFn.update = sonnerToast.update;
  toastFn.promise = sonnerToast.promise;

  return toastFn as ToastFunction;
};

// Export the single toast instance
export const toast = createToast();

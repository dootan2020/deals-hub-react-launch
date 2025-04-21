
import React, { ReactNode } from "react";
import { toast as sonnerToast, type ExternalToast } from "sonner";

// Toast kiểu này chỉ gồm title, description, variant (không có open)
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

const createToast = (): ToastFunction => {
  const toastFn = ((titleOrOptions: any, description?: ReactNode) => {
    if (typeof titleOrOptions === 'object' && titleOrOptions !== null && !React.isValidElement(titleOrOptions)) {
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
      return sonnerToast(titleOrOptions, { description });
    }
  }) as ToastFunction;

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

export const toast = createToast();

export const useToast = () => {
  return {
    toast,
    toasts: []
  };
};

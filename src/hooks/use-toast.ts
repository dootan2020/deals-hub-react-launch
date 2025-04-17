
import { toast as sonnerToast, type ToastT } from "sonner";

export type ToastProps = ToastT;

export function toast(...args: Parameters<typeof sonnerToast>) {
  return sonnerToast(...args);
}

toast.success = sonnerToast.success;
toast.error = sonnerToast.error;
toast.info = sonnerToast.info;
toast.warning = sonnerToast.warning;
toast.loading = sonnerToast.loading;
toast.dismiss = sonnerToast.dismiss;
toast.custom = sonnerToast.custom;
toast.promise = sonnerToast.promise;

// This is a dummy array to make the `Toaster` component happy
const DUMMY_TOASTS: ToastProps[] = [];

export const useToast = () => {
  return {
    toast,
    toasts: DUMMY_TOASTS,
  };
};

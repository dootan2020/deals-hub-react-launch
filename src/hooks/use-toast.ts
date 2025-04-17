
import { toast as sonnerToast, type Toast } from "sonner";

export type ToastProps = Toast;

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

export const useToast = () => {
  return {
    toast,
  };
};

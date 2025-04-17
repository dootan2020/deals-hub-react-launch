
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  id: string | number;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  type?: "default" | "success" | "error" | "warning" | "info";
  // Include any other properties that might be used
  duration?: number;
  className?: string;
  variant?: "default" | "destructive"; // Add this for shadcn/ui compatibility
  [key: string]: any; // Allow other properties
};

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

// Create a dummy array of toasts to satisfy the Toaster component
const DUMMY_TOASTS: ToastProps[] = [];

export const useToast = () => {
  return {
    toast,
    toasts: DUMMY_TOASTS,
  };
};

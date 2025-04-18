
import { toast as sonnerToast, type ToastT } from "sonner";

type ToastProps = {
  id?: string | number;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
  className?: string;
  [key: string]: any; // Allow other properties
};

// Our custom toast function that adapts the shadcn/ui toast API to Sonner
export function toast(props: ToastProps) {
  const { title, description, variant, ...rest } = props;
  
  // Map destructive variant to error type
  const type = variant === "destructive" ? "error" : "default";
  
  return sonnerToast(title as string, {
    description,
    ...rest,
    // Only add type if it's not default to avoid unnecessary props
    ...(type !== "default" ? { type } : {})
  });
}

// Expose original Sonner methods
toast.success = sonnerToast.success;
toast.error = sonnerToast.error;
toast.info = sonnerToast.info;
toast.warning = sonnerToast.warning;
toast.loading = sonnerToast.loading;
toast.dismiss = sonnerToast.dismiss;
toast.custom = sonnerToast.custom;
toast.promise = sonnerToast.promise;

// Create a hook that returns a collection of toasts
export const useToast = () => {
  return {
    toast,
    // For compatibility with shadcn/ui Toaster component
    toasts: [] as ToastT[],
  };
};

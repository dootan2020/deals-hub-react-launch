import { toast as sonnerToast, type ToastT } from "sonner";

type ToastProps = {
  id?: string | number;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
  className?: string;
  type?: "success" | "error" | "warning" | "info";
  [key: string]: any; // Allow other properties
};

// Our custom toast function that adapts the shadcn/ui toast API to Sonner
export function toast(props: ToastProps) {
  const { title, description, variant, type: explicitType, ...rest } = props;
  
  // Map destructive variant to error type or use explicit type
  const type = explicitType || (variant === "destructive" ? "error" : "default");
  
  return sonnerToast(title as string, {
    description,
    ...rest,
    // Only add type if it's not default to avoid unnecessary props
    ...(type !== "default" ? { type } : {})
  });
}

// Add helper methods for specific toast types
toast.success = (title: string, description?: string, options = {}) => {
  return sonnerToast.success(title, { description, ...options });
};

toast.error = (title: string, description?: string, options = {}) => {
  return sonnerToast.error(title, { description, ...options });
};

toast.warning = (title: string, description?: string, options = {}) => {
  return sonnerToast(title, { 
    description, 
    type: "warning", 
    icon: "⚠️", 
    ...options 
  });
};

toast.info = (title: string, description?: string, options = {}) => {
  return sonnerToast.info(title, { description, ...options });
};

// Keep other Sonner methods
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

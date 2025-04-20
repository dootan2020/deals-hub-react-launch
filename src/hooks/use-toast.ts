
import { toast as sonnerToast, type ToastT } from "sonner";
import { AlertTriangle } from "lucide-react";
import { createElement } from "react";

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
  
  // If variant is destructive, use the error type
  if (variant === "destructive") {
    return sonnerToast.error(title as string, {
      description,
      ...rest
    });
  }
  
  return sonnerToast(title as string, {
    description,
    ...rest
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
    icon: createElement(AlertTriangle, { className: "h-5 w-5 text-amber-500" }),
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

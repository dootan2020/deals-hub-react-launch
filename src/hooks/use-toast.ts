
import { toast as sonnerToast, type ToastT } from "sonner";
import { useToast as useShadcnToast } from "@/components/ui/toast";

// Re-export toast utility
export const useToast = useShadcnToast;

// Create a type for the toast function return
type ToastReturn = string | number;

// Re-export toast utility with enhanced methods
export const toast = {
  success(title: string, description?: string): ToastReturn {
    if (description) {
      return sonnerToast.success(title, { description });
    }
    return sonnerToast.success(title);
  },
  
  error(title: string, description?: string): ToastReturn {
    if (description) {
      return sonnerToast.error(title, { description });
    }
    return sonnerToast.error(title);
  },
  
  warning(title: string, description?: string): ToastReturn {
    if (description) {
      return sonnerToast.warning(title, { description });
    }
    return sonnerToast.warning(title);
  },
  
  info(title: string, description?: string): ToastReturn {
    if (description) {
      return sonnerToast.info(title, { description });
    }
    return sonnerToast.info(title);
  },
  
  loading(title: string, description?: string): ToastReturn {
    if (description) {
      return sonnerToast.loading(title, { description });
    }
    return sonnerToast.loading(title);
  },
  
  dismiss(toastId?: string | number): void {
    sonnerToast.dismiss(toastId);
  },
  
  // Pass through other sonner toast methods
  ...sonnerToast
};

// Export the toast type for use in other components
export type Toast = {
  (props: { title?: string; description?: string; variant?: "default" | "destructive" | "success" | "warning" }): string | number;
} & typeof toast;

// Make the toast object callable as a function
const toastFunction = ((props: { 
  title?: string; 
  description?: string; 
  variant?: "default" | "destructive" | "success" | "warning" 
}) => {
  const { title, description, variant } = props;
    
  if (variant === "destructive") {
    return sonnerToast.error(title || "", { description });
  } else if (variant === "success") {
    return sonnerToast.success(title || "", { description });
  } else if (variant === "warning") {
    return sonnerToast.warning(title || "", { description });
  } else {
    return sonnerToast.info(title || "", { description });
  }
}) as Toast;

// Copy all properties from toast to toastFunction
Object.keys(toast).forEach(key => {
  (toastFunction as any)[key] = (toast as any)[key];
});

// Export the toast function with all methods
export { toastFunction as toast };


import { toast as sonnerToast } from "sonner";
import { useToast as useShadcnToast } from "@/components/ui/toast";

// Re-export toast utility
export const useToast = useShadcnToast;

// Re-export toast utility with enhanced methods
export const toast = {
  ...sonnerToast,
  // Basic toast methods
  success: (title: string, description?: string) => {
    if (description) {
      return sonnerToast.success(title, { description });
    }
    return sonnerToast.success(title);
  },
  error: (title: string, description?: string) => {
    if (description) {
      return sonnerToast.error(title, { description });
    }
    return sonnerToast.error(title);
  },
  warning: (title: string, description?: string) => {
    if (description) {
      return sonnerToast.warning(title, { description });
    }
    return sonnerToast.warning(title);
  },
  info: (title: string, description?: string) => {
    if (description) {
      return sonnerToast.info(title, { description });
    }
    return sonnerToast.info(title);
  },
  loading: (title: string, description?: string) => {
    if (description) {
      return sonnerToast.loading(title, { description });
    }
    return sonnerToast.loading(title);
  },
  dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
  // For compatibility with the old toast API
  // For components using the object syntax: toast({ title, description, variant })
  (props: { title?: string; description?: string; variant?: "default" | "destructive" | "success" | "warning" }) {
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
  }
};

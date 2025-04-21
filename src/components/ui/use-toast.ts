
// Re-export from hooks to avoid circular references
import { useToast, toast, type ToastFunction, type Toast } from "@/hooks/use-toast";

export { 
  useToast,
  toast,
  type Toast,
  type ToastFunction
};

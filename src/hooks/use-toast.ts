
import { useToast as useShadcnToast, toast as shadcnToast } from "@/components/ui/toast";

// Re-export toast utility with additional methods
export const useToast = useShadcnToast;

// Re-export toast utility with additional methods
export const toast = {
  ...shadcnToast,
  success: (message: string) => shadcnToast({ description: message, variant: "success", type: "success" }),
  error: (message: string) => shadcnToast({ description: message, variant: "destructive", type: "destructive" }),
  warning: (message: string) => shadcnToast({ description: message, variant: "warning", type: "warning" }),
  info: (message: string) => shadcnToast({ description: message })
};

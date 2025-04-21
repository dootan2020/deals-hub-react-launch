
import { useToast as useShadcnToast } from "@/components/ui/use-toast";
import { toast as shadcnToast } from "@/components/ui/use-toast";

// Re-export toast from shadcn with consistent interface
export const useToast = useShadcnToast;

// Re-export toast utility with additional methods
export const toast = {
  ...shadcnToast,
  success: (message: string) => shadcnToast({ description: message, variant: "success" }),
  error: (message: string) => shadcnToast({ description: message, variant: "destructive" }),
  warning: (message: string) => shadcnToast({ description: message, variant: "warning" }),
  info: (message: string) => shadcnToast({ description: message })
};

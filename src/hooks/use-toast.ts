
import { useToast as useShadcnToast } from "@/components/ui/toast";
import { toast as shadcnToast } from "@/components/ui/toast";

// Define a local type to avoid circular reference
export const useToast = useShadcnToast;

// Re-export toast utility with additional methods
export const toast = {
  ...shadcnToast,
  success: (message: string) => shadcnToast({ description: message, variant: "success" }),
  error: (message: string) => shadcnToast({ description: message, variant: "destructive" }),
  warning: (message: string) => shadcnToast({ description: message, variant: "warning" }),
  info: (message: string) => shadcnToast({ description: message })
};

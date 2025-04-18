
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { createElement } from "react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // Map sonner toast type to shadcn/ui toast variant if needed
        const variant = props.type === "error" ? "destructive" : "default"
        
        // Extract properties that don't match shadcn/ui Toast component props
        // to prevent them from being passed down and causing type errors
        const { 
          type, 
          icon, 
          jsx, 
          richColors, 
          invert, 
          closeButton, 
          dismissible,
          // Add any other sonner-specific props that don't exist in shadcn/ui Toast
          ...compatibleProps 
        } = props

        return (
          <Toast key={id} {...compatibleProps} variant={variant}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action && <div className="action">{action}</div>}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

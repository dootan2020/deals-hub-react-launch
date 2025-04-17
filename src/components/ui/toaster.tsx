
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // Map sonner toast type to shadcn/ui toast variant if needed
        const variant = props.type === "error" ? "destructive" : "default"
        
        // Remove properties that don't match shadcn/ui Toast component props
        const { type, icon, jsx, richColors, invert, closeButton, dismissible, ...compatibleProps } = props

        return (
          <Toast key={id} {...compatibleProps} variant={variant}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action && <div className="action">{action as React.ReactNode}</div>}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

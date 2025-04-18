
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { ReactNode } from "react"

interface ToastAction {
  altText: string;
  onClick: () => void;
  element: ReactNode;
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const variant = props.type === "error" ? "destructive" : "default"
        
        const { 
          type, 
          icon, 
          jsx, 
          richColors, 
          invert, 
          closeButton, 
          dismissible,
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
            {action && <div className="action">{action as ReactNode}</div>}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}


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

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // Handle destructive type as variant
        let variant = props.variant;
        if (props.type === "destructive") {
          variant = "destructive";
        } else if (props.type === "success") {
          variant = "success";
        } else if (props.type === "warning") {
          variant = "warning";
        }
        
        // Filter out properties that don't belong in Toast props
        const { type, ...compatibleProps } = props;

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
      <ToastViewport className="z-50" />
    </ToastProvider>
  )
}

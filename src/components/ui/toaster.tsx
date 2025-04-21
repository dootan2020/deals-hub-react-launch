
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
        // Map type to variant for compatibility
        const variantMapping: Record<string, string> = {
          'default': 'default',
          'destructive': 'destructive',
          'success': 'success',
          'warning': 'warning'
        };
        
        let variantProp = props.type && variantMapping[props.type] 
          ? variantMapping[props.type] 
          : 'default';
        
        // Filter out properties that don't belong in Toast props
        const { type, ...compatibleProps } = props;

        return (
          <Toast key={id} {...compatibleProps} variant={variantProp as any}>
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

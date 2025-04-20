
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { Check, X, AlertTriangle, Info, Loader } from "lucide-react"
import { cn } from "@/lib/utils"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: cn(
          "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground",
          "group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          "group-[.toaster]:rounded-md group-[.toaster]:p-4",
          "group-[.toaster]:flex group-[.toaster]:items-start"
        ),
        descriptionClassName: "group-[.toast]:text-muted-foreground text-sm mt-1",
      }}
      {...props}
    >
      {/* Custom icons passed as children instead of in toastOptions */}
      {({ toast }) => (
        <div>
          {toast.type === 'success' && <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />}
          {toast.type === 'error' && <X className="h-5 w-5 text-red-500 mr-3 mt-0.5 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 shrink-0" />}
          {toast.type === 'info' && <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 shrink-0" />}
          {toast.type === 'loading' && <Loader className="h-5 w-5 text-primary animate-spin mr-3 mt-0.5 shrink-0" />}
          {toast.title || toast.description}
        </div>
      )}
    </Sonner>
  )
}

export { Toaster }
export { toast } from "sonner"

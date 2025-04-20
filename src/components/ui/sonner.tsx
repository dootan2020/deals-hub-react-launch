
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
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
    />
  )
}

export { Toaster }
export { toast } from "sonner"

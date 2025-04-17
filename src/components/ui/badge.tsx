
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-gray-700 hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-gray-700 border-gray-300",
        hot: "border-transparent bg-gradient-to-r from-[#E67E22] to-[#FF9F43] text-white", 
        featured: "border-transparent bg-gradient-to-r from-[#27AE60] to-[#45C25A] text-white",
        bestseller: "border-transparent bg-gradient-to-r from-[#2E5BFF] to-[#5881FF] text-white",
        discount: "border-transparent bg-gradient-to-r from-[#c0392b] to-[#e74c3c] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

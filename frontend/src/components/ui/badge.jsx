import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-100 text-green-800 hover:bg-green-100/80",
        warning: "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
        info: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100/80",
        danger: "border-transparent bg-red-100 text-red-800 hover:bg-red-100/80",
        urgent: "border-transparent bg-red-600 text-white hover:bg-red-600/80",
        high: "border-transparent bg-orange-500 text-white hover:bg-orange-500/80",
        medium: "border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80",
        low: "border-transparent bg-gray-400 text-white hover:bg-gray-400/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

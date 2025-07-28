import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded px-2.5 py-0.5 text-xs font-semibold transition-colors font-sans border-0 focus:outline-none focus:ring-2 focus:ring-dts-blue focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-dts-neongreen text-dts-black hover:bg-dts-lightblue",
        secondary:
          "bg-dts-lightblue text-dts-darkblue hover:bg-dts-blue",
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
        outline: "bg-white text-dts-darkblue border border-dts-blue/30",
        dark: "bg-dts-darkblue text-white",
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

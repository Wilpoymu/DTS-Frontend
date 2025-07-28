import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors shadow-md font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dts-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-dts-darkblue text-white hover:bg-dts-blue",
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
        outline:
          "border border-dts-blue bg-white text-dts-blue hover:bg-dts-lightblue/20 hover:text-dts-darkblue",
        secondary:
          "bg-dts-blue text-white hover:bg-dts-darkblue",
        ghost: "hover:bg-dts-lightblue/20 hover:text-dts-darkblue",
        link: "text-dts-blue underline-offset-4 hover:underline hover:text-dts-darkblue",
        accent: "bg-dts-neongreen text-dts-black hover:bg-dts-lightblue",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

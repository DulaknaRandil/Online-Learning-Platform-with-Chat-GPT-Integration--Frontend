import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-opacity-30",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-300/20 hover:shadow-lg border-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-transform",
        destructive: "bg-red-600 text-white hover:bg-red-700 hover:shadow-red-300/20 hover:shadow-lg border-red-500 hover:scale-[1.02] active:scale-[0.98] transition-transform",
        outline: "border border-blue-300 bg-white hover:bg-blue-100 text-blue-800 hover:text-blue-900 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform",
        secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:shadow-gray-300/20 hover:shadow-lg border-gray-300 hover:scale-[1.02] active:scale-[0.98] transition-transform",
        ghost: "hover:bg-blue-100 hover:text-blue-900 text-blue-800 hover:scale-[1.02] active:scale-[0.98] transition-transform",
        link: "text-blue-600 underline-offset-4 hover:underline hover:scale-[1.02] active:scale-[0.98] transition-transform",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 rounded-xl px-4",
        lg: "h-12 rounded-xl px-10 text-base",
        icon: "h-11 w-11 rounded-full",
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
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-gradient-purple text-white hover:opacity-90 hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30":
              variant === "default",
            "bg-muted text-foreground hover:bg-muted/80":
              variant === "secondary",
            "border-2 border-foreground/20 bg-background hover:bg-muted":
              variant === "outline",
            "hover:bg-muted/50": variant === "ghost",
          },
          {
            "h-11 px-8 text-base": size === "default",
            "h-9 px-6 text-sm": size === "sm",
            "h-14 px-10 text-lg": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

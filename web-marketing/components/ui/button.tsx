import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "earth" | "forest" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "earth", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A7C59] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
          "after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:w-0 after:h-0 after:rounded-full after:bg-white/40 after:transform after:-translate-x-1/2 after:-translate-y-1/2 after:transition-all after:duration-600 hover:after:w-[400px] hover:after:h-[400px]",
          {
            "bg-gradient-earth text-[#FAF8F3] hover:-translate-y-1 shadow-[0_4px_12px_rgba(62,39,35,0.08)] hover:shadow-[0_10px_30px_rgba(44,95,45,0.15)]":
              variant === "earth",
            "bg-gradient-forest text-[#FAF8F3] hover:-translate-y-1 shadow-[0_4px_12px_rgba(62,39,35,0.08)] hover:shadow-[0_10px_30px_rgba(44,95,45,0.15)]":
              variant === "forest",
            "border-2 border-[#B85C38] bg-transparent text-[#B85C38] hover:bg-[#B85C38] hover:text-[#FAF8F3]":
              variant === "outline",
            "hover:bg-[#F5F1E8]": variant === "ghost",
          },
          {
            "h-auto py-[18px] px-9 text-base rounded-[48px]": size === "default",
            "h-auto py-3 px-6 text-sm rounded-[48px]": size === "sm",
            "h-auto py-5 px-11 text-lg rounded-[48px]": size === "lg",
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

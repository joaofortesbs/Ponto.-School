
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none touch-manipulation active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline active:text-primary/80",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10 min-h-10 min-w-10",
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
  ({ className, variant, size, asChild = false, onClick, onMouseDown, onMouseUp, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      // Garantir que o clique seja processado corretamente
      if (onClick && !props.disabled) {
        e.stopPropagation();
        onClick(e);
      }
    }, [onClick, props.disabled]);

    const handleMouseDown = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (onMouseDown && !props.disabled) {
        onMouseDown(e);
      }
    }, [onMouseDown, props.disabled]);

    const handleMouseUp = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (onMouseUp && !props.disabled) {
        onMouseUp(e);
      }
    }, [onMouseUp, props.disabled]);
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          touchAction: 'manipulation',
          pointerEvents: props.disabled ? 'none' : 'auto',
          ...props.style
        }}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

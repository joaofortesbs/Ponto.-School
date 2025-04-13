import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
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

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  // Se não houver aria-label e houver apenas um ícone como filho, adiciona uma mensagem de aviso
  const hasAriaLabel = props["aria-label"] !== undefined;
  const hasAriaLabelledBy = props["aria-labelledby"] !== undefined;
  const hasAccessibleLabel = hasAriaLabel || hasAriaLabelledBy || 
                             (props.children && typeof props.children === 'string');

  // Adicionar garantias de acessibilidade
  const accessibilityProps: Record<string, any> = {};

  // Se o botão for do tipo ícone (small/icon) e não tiver um label acessível
  if (size === "icon" && !hasAccessibleLabel) {
    console.warn('Button with icon needs an aria-label for accessibility');
  }

  // Garantir que botões de submit e reset tenham o tipo correto
  if (!props.type && (Comp === "button" || !asChild)) {
    accessibilityProps.type = "button"; // Padrão para button
  }

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...accessibilityProps}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
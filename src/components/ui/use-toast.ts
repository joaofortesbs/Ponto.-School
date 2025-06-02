
// Re-export from the hooks directory for backward compatibility
export { useToast, toast } from "@/hooks/use-toast"

// Types
import * as React from "react"
import type { VariantProps } from "class-variance-authority"
import { toastVariants } from "@/components/ui/toast"

type ToastProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof toastVariants> & {
    onOpenChange?: (open: boolean) => void
    open?: boolean
  }

export type { ToastProps }

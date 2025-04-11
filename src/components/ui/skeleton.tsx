import { cn } from "@/lib/utils"
import { TypewriterLoader } from "./typewriter-loader";

function Skeleton({
  className,
  useTypewriter = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { useTypewriter?: boolean }) {
  if (useTypewriter) {
    return <div className="relative w-full h-full min-h-[100px]"><TypewriterLoader className={className} /></div>;
  }
  
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  )
}

export { Skeleton }

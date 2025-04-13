
import React from "react";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/style-utils";

interface ViewToggleProps {
  view: "grid" | "list";
  onToggle: () => void;
  className?: string;
  gridIcon?: React.ReactNode;
  listIcon?: React.ReactNode;
  showLabels?: boolean;
}

/**
 * Componente para alternar entre visualizações em grade e lista
 */
export function ViewToggle({
  view,
  onToggle,
  className,
  gridIcon = <LayoutGrid className="h-4 w-4" />,
  listIcon = <List className="h-4 w-4" />,
  showLabels = false,
}: ViewToggleProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showLabels && (
        <span className="text-sm text-muted-foreground mr-2">
          Visualização:
        </span>
      )}
      <div className="border rounded-md flex">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "px-2.5 rounded-r-none border-r",
            view === "grid" ? "bg-muted" : "hover:bg-transparent"
          )}
          onClick={() => view !== "grid" && onToggle()}
        >
          {gridIcon}
          {showLabels && <span className="ml-1.5">Grade</span>}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "px-2.5 rounded-l-none",
            view === "list" ? "bg-muted" : "hover:bg-transparent"
          )}
          onClick={() => view !== "list" && onToggle()}
        >
          {listIcon}
          {showLabels && <span className="ml-1.5">Lista</span>}
        </Button>
      </div>
    </div>
  );
}

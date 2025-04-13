
import { List, LayoutGrid } from "lucide-react";
import { Button } from "../ui/button";

interface ViewToggleProps {
  viewMode: "grid" | "list";
  onChange: (mode: "grid" | "list") => void;
  highlightColor?: string;
}

/**
 * Reusable component for toggling between grid and list views
 */
export function ViewToggle({ 
  viewMode, 
  onChange, 
  highlightColor = "bg-[#FF6B00] text-white" 
}: ViewToggleProps) {
  return (
    <div className="flex items-center border rounded-md overflow-hidden">
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="icon"
        className={`h-8 w-8 rounded-none ${viewMode === "list" ? highlightColor : ""}`}
        onClick={() => onChange("list")}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="icon"
        className={`h-8 w-8 rounded-none ${viewMode === "grid" ? highlightColor : ""}`}
        onClick={() => onChange("grid")}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}

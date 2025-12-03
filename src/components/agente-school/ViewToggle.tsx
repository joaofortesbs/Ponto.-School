import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

type ViewMode = "grid" | "list";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ViewToggle = ({ viewMode, onViewModeChange }: ViewToggleProps) => {
  return (
    <div className="flex border rounded-md overflow-hidden">
      <Button
        variant="ghost"
        size="sm"
        className={`rounded-none px-3 ${viewMode === "grid" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
        onClick={() => onViewModeChange("grid")}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`rounded-none px-3 ${viewMode === "list" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
        onClick={() => onViewModeChange("list")}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ViewToggle;

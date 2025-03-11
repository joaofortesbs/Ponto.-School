import { cn } from "@/lib/utils";
import { SidebarNav } from "@/components/sidebar/SidebarNav";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  className,
  isCollapsed = false,
  onToggleCollapse,
  ...props
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isCollapsed);

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden",
          isMobileOpen ? "block" : "hidden",
        )}
        onClick={() => setIsMobileOpen(false)}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full bg-white dark:bg-[#001427]/90 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out md:relative",
          sidebarCollapsed ? "w-[70px]" : "w-[240px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className,
        )}
        {...props}
      >
        <div className="flex h-[72px] items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 relative">
          <div
            className={cn(
              "flex items-center gap-2 transition-all duration-300",
              sidebarCollapsed ? "opacity-0 w-0" : "opacity-100",
            )}
          >
            <img src="/vite.svg" alt="Logo" className="h-8 w-8" />
            <span className="font-bold text-lg text-[#001427] dark:text-white">
              Ponto.School
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleCollapse}
            className={cn(
              "h-8 w-8 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 border-[#FF6B00]/30 transition-all duration-300 absolute shadow-sm hover:shadow-md",
              sidebarCollapsed ? "right-2" : "right-2",
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
        <SidebarNav
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
          className="p-2"
        />
      </aside>
    </>
  );
}

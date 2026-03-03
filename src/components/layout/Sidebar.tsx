import { cn } from "@/lib/utils";
import { SidebarNav } from "@/components/sidebar/SidebarNav";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const SIDEBAR_WIDTH_EXPANDED = 260;
const SIDEBAR_WIDTH_COLLAPSED = 72;
const SIDEBAR_MARGIN_Y = 16;
const SIDEBAR_BORDER_RADIUS = 20;

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleToggleCollapse = () => {
    setSidebarCollapsed((prev) => !prev);
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  const handleSidebarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    let node: HTMLElement | null = e.target as HTMLElement;
    const container = e.currentTarget as HTMLElement;
    while (node && node !== container) {
      const tag = (node.tagName || "").toUpperCase();
      if (["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"].includes(tag)) return;
      if (node.classList) {
        if (
          node.classList.contains("menu-item") ||
          node.classList.contains("sub-item") ||
          node.classList.contains("expandable-item") ||
          node.classList.contains("cursor-pointer")
        ) return;
      }
      node = node.parentElement;
    }
    handleToggleCollapse();
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

      {/* Mobile Sidebar Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden",
          isMobileOpen ? "block" : "hidden",
        )}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar Container */}
      <div
        className={cn(
          "fixed top-0 left-0 z-[10000] h-full flex flex-col transition-[width,transform] duration-[380ms] ease-in-out md:relative",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className,
        )}
        style={{
          width: sidebarCollapsed ? `${SIDEBAR_WIDTH_COLLAPSED}px` : `${SIDEBAR_WIDTH_EXPANDED}px`,
          paddingTop: `${SIDEBAR_MARGIN_Y}px`,
          paddingBottom: `${SIDEBAR_MARGIN_Y}px`,
          willChange: "width",
        }}
        {...props}
      >
        {/* Card principal do menu lateral */}
        <aside
          className={cn(
            "flex-1 flex flex-col bg-white dark:bg-[#030C2A] border border-gray-200 dark:border-gray-800/50 overflow-hidden backdrop-blur-sm shadow-lg"
          )}
          style={{
            borderTopRightRadius: `${SIDEBAR_BORDER_RADIUS}px`,
            borderBottomRightRadius: `${SIDEBAR_BORDER_RADIUS}px`,
            borderTopLeftRadius: "0px",
            borderBottomLeftRadius: "0px",
            borderLeft: "none",
            marginLeft: "0px",
            cursor: sidebarCollapsed ? "e-resize" : "w-resize",
          }}
        >
          <div
            className="relative flex-1 flex flex-col overflow-hidden"
            onClick={handleSidebarClick}
          >
            <SidebarNav
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={handleToggleCollapse}
              className={cn(
                "p-2 flex-1 overflow-y-auto",
                "pt-4"
              )}
            />
          </div>
        </aside>
      </div>
    </>
  );
}

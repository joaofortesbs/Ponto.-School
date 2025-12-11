import { cn } from "@/lib/utils";
import { SidebarNav } from "@/components/sidebar/SidebarNav";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [isHovered, setIsHovered] = useState(false);

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

      {/* Mobile Sidebar Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden",
          isMobileOpen ? "block" : "hidden",
        )}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar Container - Container vertical que envolve todo o menu */}
      <div
        className={cn(
          "fixed top-0 left-0 z-30 h-full flex flex-col transition-all duration-300 ease-in-out md:relative",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className,
        )}
        style={{
          width: sidebarCollapsed ? `${SIDEBAR_WIDTH_COLLAPSED}px` : `${SIDEBAR_WIDTH_EXPANDED}px`,
          paddingTop: `${SIDEBAR_MARGIN_Y}px`,
          paddingBottom: `${SIDEBAR_MARGIN_Y}px`,
        }}
        {...props}
      >
        {/* Card principal do menu lateral */}
        <aside
          className={cn(
            "flex-1 flex flex-col bg-white dark:bg-[#030C2A] border border-gray-200 dark:border-gray-800/50 transition-all duration-300 ease-in-out overflow-hidden backdrop-blur-sm shadow-lg"
          )}
          style={{
            borderTopRightRadius: `${SIDEBAR_BORDER_RADIUS}px`,
            borderBottomRightRadius: `${SIDEBAR_BORDER_RADIUS}px`,
            borderTopLeftRadius: '0px',
            borderBottomLeftRadius: '0px',
            borderLeft: 'none',
            marginLeft: '0px',
          }}
          key="sidebar-container"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative flex-1 flex flex-col overflow-hidden">
            <SidebarNav
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={handleToggleCollapse}
              className={cn(
                "p-2 flex-1 overflow-y-auto",
                sidebarCollapsed ? "pt-4" : "pt-4"
              )}
            />

            {/* Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleCollapse}
              className={cn(
                "h-6 w-6 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 border-[#FF6B00]/30 transition-all duration-300 shadow-sm hover:shadow-md z-10 mx-auto",
                sidebarCollapsed
                  ? cn("mb-4", isHovered ? "opacity-100" : "opacity-0")
                  : cn("absolute top-4 right-2", isHovered ? "opacity-100" : "opacity-0")
              )}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronLeft className="h-3 w-3" />
              )}
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
}

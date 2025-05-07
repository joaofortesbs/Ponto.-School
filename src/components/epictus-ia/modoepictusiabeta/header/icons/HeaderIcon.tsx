import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeaderIconProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick?: () => void;
  badgeCount?: number;
  active?: boolean;
  style?: React.CSSProperties;
}

const HeaderIcon: React.FC<HeaderIconProps> = ({
  icon,
  tooltip,
  onClick,
  badgeCount,
  active = false,
  style,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`relative w-10 h-10 rounded-full ${
              active 
                ? "bg-[#102C51] text-[#4A9FFF] ring-2 ring-[#1E63B4]/50" 
                : "bg-[#0A1F38] text-[#7EB6F7] hover:bg-[#0F2A4F] hover:text-[#A9D2FF]"
            } shadow-lg transition-all duration-200 header-icon-button backdrop-blur-sm`}
            onClick={onClick}
            style={{ 
              height: "40px", 
              width: "40px",
              boxShadow: active ? '0 0 10px rgba(28, 100, 242, 0.4)' : '0 4px 6px rgba(0, 0, 0, 0.15)',
              ...style
            }}
          >
            {icon}
            {badgeCount && badgeCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#F44336] to-[#E53935] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg border border-[#FFFFFF]/20 animate-pulse">
                {badgeCount > 9 ? "9+" : badgeCount}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-[#0F172A]/95 text-white border-[#1E293B] shadow-lg backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HeaderIcon;
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeaderIconProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick?: () => void;
  badgeCount?: number;
  active?: boolean;
}

const HeaderIcon: React.FC<HeaderIconProps> = ({
  icon,
  tooltip,
  onClick,
  badgeCount,
  active = false,
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
                ? "bg-[#0D3B66] text-[#64B5F6]" 
                : "bg-[#0A2540] text-[#90CAF9] hover:bg-[#0D3B66]"
            } shadow-md transition-all duration-200 header-icon-button`}
            onClick={onClick}
            style={{ height: "40px", width: "40px" }}
          >
            {icon}
            {badgeCount && badgeCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#F44336] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                {badgeCount > 9 ? "9+" : badgeCount}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-[#0F172A] text-white border-[#1E293B] shadow-lg">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HeaderIcon;
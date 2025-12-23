
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GuiaAvatarProps {
  className?: string;
}

const GuiaAvatar: React.FC<GuiaAvatarProps> = ({ className = "" }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`w-12 h-12 rounded-full border-2 border-orange-500 overflow-hidden flex items-center justify-center ${className}`}>
            <img
              src="/images/avatar11-sobreposto-pv.webp"
              alt="Agente Professor"
              className="w-full h-full object-cover"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm font-semibold">Agente Professor</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default GuiaAvatar;

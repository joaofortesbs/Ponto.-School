import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FavoriteStarProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const FavoriteStar: React.FC<FavoriteStarProps> = ({
  isFavorite,
  onToggle,
  size = "md",
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            className={`focus:outline-none ${className}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileTap={{ scale: 0.8 }}
            animate={{
              rotate: isFavorite && isHovered ? [0, -15, 15, -10, 10, 0] : 0,
            }}
            transition={{ duration: 0.5 }}
          >
            <Star
              className={`${sizeMap[size]} ${isFavorite ? "text-yellow-400 fill-yellow-400" : "text-gray-400 dark:text-gray-600 hover:text-yellow-400 dark:hover:text-yellow-400"} transition-colors duration-200`}
            />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FavoriteStar;

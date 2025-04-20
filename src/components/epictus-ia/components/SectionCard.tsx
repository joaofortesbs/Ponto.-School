
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  badge?: string | null;
  onClick: () => void;
  isActive?: boolean;
}

export default function SectionCard({
  icon,
  title,
  description,
  color,
  badge,
  onClick,
  isActive = false,
}: SectionCardProps) {
  const { theme } = useTheme();
  
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-xl overflow-hidden border transition-all cursor-pointer group",
        isActive 
          ? `shadow-lg border-2 ${color.includes('from') ? 'border-opacity-50 border-white' : `border-${color}-400`}` 
          : `border ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`,
        theme === "dark" ? "bg-gray-800/90" : "bg-white/90",
      )}
      style={{
        backdropFilter: "blur(8px)",
      }}
      onClick={onClick}
    >
      <div className={`p-5 flex flex-col justify-between h-full relative overflow-hidden`}>
        {/* Efeito de brilho no hover */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-[50px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 rotate-45 translate-x-[-120%] group-hover:translate-x-[120%] duration-1500 transition-all ease-in-out"></div>
        </div>
        
        {/* Conteúdo do Card */}
        <div className="flex justify-between items-start relative z-10">
          <div 
            className={`w-12 h-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center`}
          >
            {icon}
          </div>
          
          {badge && (
            <Badge 
              className={`bg-white/90 text-xs font-medium ${
                badge === "Novo" 
                  ? "text-emerald-600" 
                  : badge === "Beta" 
                  ? "text-purple-600" 
                  : badge === "Popular" 
                  ? "text-blue-600"
                  : "text-amber-600"
              }`}
            >
              {badge}
            </Badge>
          )}
        </div>
        
        <div className="mt-3 relative z-10">
          <h3 className={`text-base font-semibold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {title}
          </h3>
          <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"} line-clamp-2`}>
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

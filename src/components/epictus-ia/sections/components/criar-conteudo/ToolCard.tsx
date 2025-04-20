import React from "react";
import { ArrowRight } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  href: string;
}

const ToolCard: React.FC<ToolCardProps> = ({
  title,
  description,
  icon,
  iconBgColor = "bg-emerald-500",
  href
}) => {
  const { theme } = useTheme();

  return (
    <div className={`rounded-xl p-4 ${theme === "dark" ? "bg-gray-800/70" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} hover:shadow-md transition-all duration-200`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center`}>
            {icon}
          </div>
          <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {title}
          </h3>
        </div>

        <p className={`mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-sm`}>
          {description}
        </p>

        <a 
          href={href}
          className={`mt-auto py-2 px-4 rounded-md ${theme === "dark" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-emerald-500 hover:bg-emerald-600"} text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors`}
        >
          Acessar <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
};

export default ToolCard;
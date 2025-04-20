
import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { LucideIcon } from "lucide-react";

interface CategoryHeaderProps {
  icon: React.ReactNode;
  title: string;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ icon, title }) => {
  const { theme } = useTheme();
  
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600">
        {icon}
      </div>
      <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
        {title}
      </h3>
    </div>
  );
};

export default CategoryHeader;

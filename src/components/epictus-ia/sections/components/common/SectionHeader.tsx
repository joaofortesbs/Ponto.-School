
import React from "react";
import { useTheme } from "@/components/ThemeProvider";

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, description }) => {
  const { theme } = useTheme();
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          {icon}
        </div>
        <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          {title}
        </h2>
      </div>
      <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"} ml-[60px]`}>
        {description}
      </p>
    </div>
  );
};

export default SectionHeader;

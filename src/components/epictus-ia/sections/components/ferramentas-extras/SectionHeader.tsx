
import React from "react";
import { useTheme } from "@/components/ThemeProvider";

interface SectionHeaderProps {
  title: string;
  description: string;
}

export default function SectionHeader({ title, description }: SectionHeaderProps) {
  const { theme } = useTheme();
  
  return (
    <div className="mb-6">
      <h2 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
        {title}
      </h2>
      <p className={`text-base ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
        {description}
      </p>
    </div>
  );
}

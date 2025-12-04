"use client";
import React from "react";

interface TopHeaderProps {
  isDarkTheme?: boolean;
  isQuizMode?: boolean;
}

const TopHeader: React.FC<TopHeaderProps> = ({ isDarkTheme = true, isQuizMode = false }) => {
  return (
    <div className="bg-transparent p-2">
      {/* TopHeader vazio - componente visual removido */}
    </div>
  );
};

export default TopHeader;
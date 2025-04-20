
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  primaryButtonIcon?: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ 
  icon, 
  title, 
  description, 
  primaryButtonText, 
  secondaryButtonText,
  primaryButtonIcon
}) => {
  const { theme } = useTheme();
  
  return (
    <Card className={`p-5 border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
          {icon}
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} flex items-center`}>
            <span className="relative">
              {title}
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-indigo-600"></span>
            </span>
          </h3>
          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            {description}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline" className={`${theme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-100"}`}>
              {secondaryButtonText}
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
              {primaryButtonText} {primaryButtonIcon && primaryButtonIcon}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InfoCard;

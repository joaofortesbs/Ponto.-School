
import React from "react";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";

export interface ToolCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge: string | null;
  buttonText: string;
}

export const ToolCard = ({ id, title, description, icon, badge, buttonText }: ToolCardProps) => {
  const { theme } = useTheme();
  
  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 border ${theme === "dark" ? "border-gray-800 hover:border-emerald-500/50 bg-gray-950/50" : "border-gray-200 hover:border-emerald-500/50 bg-white"} rounded-xl shadow-sm hover:shadow-md`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
      <div className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-base font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{title}</h3>
              {badge && (
                <Badge className="bg-indigo-600 hover:bg-indigo-700 text-[10px] py-0 px-1.5">
                  {badge}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-4 min-h-[40px]`}>
          {description}
        </p>
        <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 rounded-lg transition-all duration-200">
          {buttonText}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
};

export default ToolCard;

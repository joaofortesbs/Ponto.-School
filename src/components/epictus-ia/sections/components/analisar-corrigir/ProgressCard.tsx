
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

type ProgressItemProps = {
  label: string;
  value: string;
  percentage: number;
}

const ProgressItem = ({ label, value, percentage }: ProgressItemProps) => {
  const { theme } = useTheme();
  
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"} group-hover:text-purple-500 transition-colors duration-300`}>
          {label}
        </span>
        <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"} group-hover:text-purple-500 transition-colors duration-300`}>
          {value}
        </span>
      </div>
      <div className={`w-full h-2 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-full overflow-hidden`}>
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const ProgressCard = () => {
  const { theme } = useTheme();
  
  return (
    <Card className={`p-5 border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-500" />
          <span className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"} relative group-hover:text-purple-500 transition-colors duration-300`}>
            <span className="relative">
              Seu progresso nas análises
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-purple-500 to-violet-600"></span>
            </span>
          </span>
        </div>
        <Badge variant="outline" className={theme === "dark" ? "border-gray-700" : "border-gray-200"}>
          Últimos 30 dias
        </Badge>
      </div>

      <div className="mt-4">
        <div className="space-y-3">
          <ProgressItem label="Redações analisadas" value="5/10" percentage={50} />
          <ProgressItem label="Textos corrigidos" value="8/10" percentage={80} />
          <ProgressItem label="Análises de desempenho" value="2/10" percentage={20} />
        </div>
      </div>
    </Card>
  );
};

export default ProgressCard;

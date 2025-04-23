
import React from "react";
import { Zap } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/ThemeProvider";

export const EpictusTurboAdvancedCard: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Card className={`overflow-hidden border ${theme === "dark" ? "bg-gray-800/70 border-gray-700" : "bg-white border-gray-200"}`}>
      <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-gray-100 dark:border-[#29335C]/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-[#FF6B00] to-[#FF9B50] shadow-md">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-[#001427] dark:text-white flex items-center">
              Epictus IA
              <span className="ml-2 text-xs py-0.5 px-2 bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 rounded-full font-medium">
                Premium
              </span>
            </CardTitle>
            <p className="text-sm text-[#64748B] dark:text-white/60">
              Seu assistente de estudos pessoal
            </p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default EpictusTurboAdvancedCard;

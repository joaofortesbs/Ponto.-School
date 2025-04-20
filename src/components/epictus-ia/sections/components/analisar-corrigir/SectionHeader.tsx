
import React from "react";
import { BarChart3 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const SectionHeader = () => {
  const { theme } = useTheme();
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Analisar e Corrigir
        </h2>
      </div>
      <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"} ml-[60px]`}>
        Ferramentas para análise, correção e melhoria de trabalhos acadêmicos e desempenho
      </p>
    </div>
  );
};

export default SectionHeader;

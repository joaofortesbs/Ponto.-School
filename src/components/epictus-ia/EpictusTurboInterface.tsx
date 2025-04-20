
import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import EpictusIAHeader from "./EpictusIAHeader";
import { Construction, Zap } from "lucide-react";
import { Button } from "../ui/button";

export default function EpictusTurboInterface() {
  const { theme } = useTheme();
  
  return (
    <div className={`w-full h-full ${theme === "dark" ? "bg-[#001427]" : "bg-[#f7f9fa]"} flex flex-col transition-colors duration-300`}>
      {/* Header */}
      <EpictusIAHeader />
      
      {/* Interface Turbo em Desenvolvimento */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className={`max-w-2xl w-full rounded-xl border ${theme === "dark" ? "border-gray-800 bg-[#0A2540]/50" : "border-gray-200 bg-white/80"} p-8 text-center shadow-lg`}>
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center justify-center mb-6">
            <Construction className="h-10 w-10 text-white" />
          </div>
          
          <h2 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-[#29335C]"} mb-4`}>
            Modo Turbo
          </h2>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className={`px-3 py-1 rounded-full ${theme === "dark" ? "bg-[#FF6B00]/20" : "bg-[#FF6B00]/10"} text-[#FF6B00] text-sm font-medium`}>
              <Zap className="h-4 w-4 inline-block mr-1" />
              Em Desenvolvimento
            </span>
          </div>
          
          <p className={`text-lg ${theme === "dark" ? "text-white/70" : "text-gray-600"} mb-8`}>
            A interface Turbo do Epictus IA está sendo aprimorada para trazer uma experiência ainda mais poderosa e intuitiva.
          </p>
          
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white px-6 py-2 rounded-md shadow-md transition-all duration-300"
          >
            Voltar ao Modo Normal
          </Button>
        </div>
      </div>
    </div>
  );
}

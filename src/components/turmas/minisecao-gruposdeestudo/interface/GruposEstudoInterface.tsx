import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, BarChart2 } from "lucide-react";

interface GruposEstudoInterfaceProps {
  className?: string;
}

const GruposEstudoInterface: React.FC<GruposEstudoInterfaceProps> = ({ className }) => {
  return (
    <div className={`bg-white dark:bg-[#121827] p-6 rounded-xl shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 h-12 w-12 bg-[#FF6B00] rounded-lg flex items-center justify-center">
            <BarChart2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent font-montserrat">
              Grupos de Estudo Colaborativo
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Potencialize seu aprendizado com estudo em grupo
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90">
            <Plus className="h-4 w-4 mr-1" /> Criar Grupo
          </Button>
        </div>
      </div>
      <div className="flex justify-center items-center p-8 text-gray-500 dark:text-gray-400">
        Interface de Grupos de Estudo vazia
      </div>
    </div>
  );
};

export default GruposEstudoInterface;
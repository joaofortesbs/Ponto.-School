import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface GruposEstudoInterfaceProps {
  className?: string;
}

const GruposEstudoInterface: React.FC<GruposEstudoInterfaceProps> = ({ className }) => {
  return (
    <div className={`bg-white dark:bg-[#121827] p-6 rounded-xl shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent font-montserrat relative">
          <span className="relative z-10">Grupos de Estudo Colaborativo</span>
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] opacity-70"></span>
        </h2>
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
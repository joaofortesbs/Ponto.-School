import React from "react";
import { Card } from "@/components/ui/card";

const RotinaInteligente: React.FC = () => {
  return (
    <div className="container mx-auto p-6 max-w-[1400px]">
      <h2 className="text-2xl font-bold text-[#001427] dark:text-white bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent mb-6">
        Minha Rotina Inteligente
      </h2>

      <Card className="p-12 flex flex-col items-center justify-center text-center bg-white dark:bg-[#1E293B] rounded-xl shadow-lg border border-[#FF6B00]/10">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#FF6B00]/20 to-[#FF8C40]/20 flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center justify-center text-white text-xl">
            !
          </div>
        </div>
        <h3 className="text-xl font-medium text-[#001427] dark:text-white mb-2">
          Essa interface está em desenvolvimento
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          O recurso de Rotina Inteligente estará disponível em breve.
        </p>
      </Card>
    </div>
  );
};

export default RotinaInteligente;
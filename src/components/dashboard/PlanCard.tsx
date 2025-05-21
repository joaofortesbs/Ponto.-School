
import React from 'react';

const PlanCard: React.FC = () => {
  return (
    <div className="relative w-[277px] h-[459px] mx-auto mt-8">
      <div className="absolute w-full h-full rounded-[17px] bg-gradient-to-br from-black via-[#010615] to-[#030C2A] shadow-md border border-white/5">
        <div className="p-6 flex flex-col h-full">
          {/* Título do plano */}
          <h2 className="text-[33px] font-normal text-white mb-8 mt-4">Aprendiz</h2>
          
          {/* Separador */}
          <div className="flex justify-between w-[241px] mb-8">
            <div className="h-[1px] w-[109px] bg-[#AAAAAA]"></div>
            <div className="h-[1px] w-[109px] bg-[#AAAAAA]"></div>
          </div>
          
          {/* Benefícios */}
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="relative w-[38px] h-[22.25px] mr-4">
                <div className="absolute w-full h-full rounded-[17px] bg-gradient-to-r from-[#00F6FF] to-[#0088E9]"></div>
                <div className="absolute w-[17.16px] h-[17.3px] bg-[#080015] rounded-full top-1/2 left-0 transform -translate-y-1/2 ml-[2px]"></div>
              </div>
              <span className="text-[22px] font-normal text-white">5 Calls ao VIVO</span>
            </div>
            
            <div className="flex items-center">
              <div className="relative w-[38px] h-[22.25px] mr-4">
                <div className="absolute w-full h-full rounded-[17px] bg-gradient-to-r from-[#00F6FF] to-[#0088E9]"></div>
                <div className="absolute w-[17.16px] h-[17.3px] bg-[#080015] rounded-full top-1/2 left-0 transform -translate-y-1/2 ml-[2px]"></div>
              </div>
              <span className="text-[22px] font-normal text-white">3 Calls Suporte</span>
            </div>
            
            <div className="flex items-center">
              <div className="relative w-[38px] h-[22.25px] mr-4">
                <div className="absolute w-full h-full rounded-[17px] bg-gradient-to-r from-[#00F6FF] to-[#0088E9]"></div>
                <div className="absolute w-[17.16px] h-[17.3px] bg-[#080015] rounded-full top-1/2 left-0 transform -translate-y-1/2 ml-[2px]"></div>
              </div>
              <span className="text-[22px] font-normal text-white">1 Produto</span>
            </div>
            
            <div className="flex items-center">
              <div className="relative w-[38px] h-[22.25px] mr-4">
                <div className="absolute w-full h-full rounded-[17px] bg-gradient-to-r from-[#00F6FF] to-[#0088E9]"></div>
                <div className="absolute w-[17.16px] h-[17.3px] bg-[#080015] rounded-full top-1/2 left-0 transform -translate-y-1/2 ml-[2px]"></div>
              </div>
              <span className="text-[22px] font-normal text-white">Grupo de Alunos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;

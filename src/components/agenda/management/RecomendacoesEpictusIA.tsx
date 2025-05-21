
import React from "react";
import { Sparkles, AlertCircle, Award, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

const RecomendacoesEpictusIA = () => {
  return (
    <div className="bg-[#001427] rounded-xl overflow-hidden h-full border border-[#0D2238]">
      <div className="bg-[#FF6B00] p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="text-white h-5 w-5" />
          <h3 className="text-white font-medium">Recomendações do Epictus IA</h3>
        </div>
      </div>

      <div className="p-4 flex flex-col h-[calc(100%-56px)] space-y-4">
        <div className="bg-[#0D2238] rounded-lg p-4 border border-[#29335C]">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-400 h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="text-white font-medium">Prioridade Alta: Você tem uma prova de Física amanhã!</h4>
              <p className="text-gray-400 text-sm">
                Recomendo revisar os conceitos de Mecânica Quântica hoje à noite.
              </p>
              <div className="flex gap-2 mt-2">
                <Button className="bg-[#29335C] hover:bg-[#29335C]/80 text-white text-xs py-1 h-8 flex items-center gap-1">
                  <span>Ver Material</span>
                </Button>
                <Button className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs py-1 h-8 flex items-center gap-1">
                  <span>Criar Resumo</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0D2238] rounded-lg p-4 border border-[#29335C]">
          <div className="flex items-start gap-3">
            <Award className="text-yellow-400 h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="text-white font-medium">Seu desempenho em Química caiu 15% na última semana</h4>
              <p className="text-gray-400 text-sm">
                Quer revisar os conceitos de titulação?
              </p>
              <div className="flex gap-2 mt-2">
                <Button className="bg-[#29335C] hover:bg-[#29335C]/80 text-white text-xs py-1 h-8 flex items-center gap-1">
                  <span>Ver Desempenho</span>
                </Button>
                <Button className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs py-1 h-8 flex items-center gap-1">
                  <span>Praticar Exercícios</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0D2238] rounded-lg p-4 border border-[#29335C]">
          <div className="flex items-start gap-3">
            <Activity className="text-green-400 h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="text-white font-medium">Você está com uma sequência de 7 dias de estudo!</h4>
              <p className="text-gray-400 text-sm">
                Continue assim para ganhar mais pontos de experiência.
              </p>
              <div className="flex gap-2 mt-2">
                <Button className="bg-[#29335C] hover:bg-[#29335C]/80 text-white text-xs py-1 h-8 flex items-center gap-1">
                  <span>Ver Conquistas</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecomendacoesEpictusIA;

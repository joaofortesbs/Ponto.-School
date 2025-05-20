
import React from "react";
import { BarChart2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const ProgressoDisciplina = () => {
  const disciplinas = [
    {
      nome: "Matemática",
      progresso: 85,
      meta: 90,
      cor: "#FF6B00"
    },
    {
      nome: "Física",
      progresso: 72,
      meta: 80,
      cor: "#FF6B00"
    },
    {
      nome: "Química",
      progresso: 65,
      meta: 75,
      cor: "#FF6B00"
    },
    {
      nome: "Biologia",
      progresso: 90,
      meta: 85,
      cor: "#FF6B00"
    },
    {
      nome: "História",
      progresso: 76,
      meta: 80,
      cor: "#FF6B00"
    }
  ];

  return (
    <Card className="h-full overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-md transition-shadow flex flex-col bg-white dark:bg-gradient-to-b dark:from-[#001427] dark:to-[#001a2f] rounded-xl">
      {/* Cabeçalho estilizado como o do card Tempo de Estudo */}
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-3 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <div className="bg-white/10 p-1.5 rounded-lg mr-2">
            <BarChart2 className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-white font-semibold text-sm">Progresso por Disciplina</h3>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span className="px-2 py-0.5 rounded-md cursor-pointer transition-colors bg-white/20 font-medium">
            Semana
          </span>
          <span className="px-2 py-0.5 rounded-md cursor-pointer transition-colors hover:bg-white/30">
            Mês
          </span>
          <span className="px-2 py-0.5 rounded-md cursor-pointer transition-colors hover:bg-white/30">
            Ano
          </span>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="w-full">
            {/* Título removido do CardHeader como no modelo do Tempo de Estudo */}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 p-4">
        <div className="space-y-3">
          {disciplinas.map((disciplina, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#F8F9FA] dark:bg-[#29335C] flex items-center justify-center">
                    <span className="text-[#FF6B00] font-bold">
                      {disciplina.nome.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm text-[#29335C] dark:text-white">
                    {disciplina.nome}
                  </span>
                </div>
                <div className="flex gap-1 items-center">
                  <span className="text-sm font-medium text-[#FF6B00]">
                    {disciplina.progresso}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    | Meta: {disciplina.meta}%
                  </span>
                </div>
              </div>
              <Progress
                value={disciplina.progresso}
                className="h-2.5 bg-[#FF6B00]/10"
                indicatorClassName="bg-[#FF6B00]"
              />
            </div>
          ))}
        </div>

        {disciplinas.length === 0 && (
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-[#F8F9FA] dark:bg-[#29335C]/50 flex items-center justify-center mx-auto mb-4">
                <BarChart2 className="h-6 w-6 text-[#FF6B00]/60" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma disciplina registrada ainda
              </p>
            </div>
          </div>
        )}

        {/* Seção de média geral e metas conforme o padrão do card de Tempo de Estudo */}
        <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700/30">
          <Button 
            variant="outline" 
            className="w-full border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 mt-2"
          >
            <ExternalLink className="h-4 w-4 mr-2" /> Definir Metas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressoDisciplina;


import React from "react";
import { FileText, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const TarefasPendentes = () => {
  const tarefas = [
    {
      id: 1,
      titulo: "Lista de Exercícios - Funções Trigonométricas",
      disciplina: "Matemática",
      vencimento: "Vence hoje, 18:00",
      progresso: 75,
      prioridade: "Alta"
    },
    {
      id: 2,
      titulo: "Relatório de Experimento - Titulação",
      disciplina: "Química",
      vencimento: "Vence em 2 dias",
      progresso: 40,
      prioridade: "Média"
    },
    {
      id: 3,
      titulo: "Preparação para Prova - Mecânica Quântica",
      disciplina: "Física",
      vencimento: "Vence em 1 dia",
      progresso: 20,
      prioridade: "Alta"
    }
  ];

  return (
    <div className="bg-[#001427] rounded-xl overflow-hidden h-full border border-[#0D2238]">
      <div className="bg-[#FF6B00] p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="text-white h-5 w-5" />
          <h3 className="text-white font-medium">Tarefas Pendentes</h3>
        </div>
        <div className="bg-white text-[#FF6B00] rounded px-2 py-0.5 text-xs font-medium">
          3 tarefas
        </div>
      </div>

      <div className="p-4 flex flex-col h-[calc(100%-56px)] overflow-hidden">
        <div className="space-y-4 flex-1 overflow-y-auto">
          {tarefas.map((tarefa) => (
            <div key={tarefa.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border border-gray-500 rounded flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-white text-sm">{tarefa.titulo}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      tarefa.prioridade === "Alta" 
                        ? "bg-red-950/50 text-red-400" 
                        : "bg-yellow-950/50 text-yellow-400"
                    }`}>
                      {tarefa.prioridade}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 pl-7">
                <div className="w-4 h-4 rounded-full bg-opacity-30 flex items-center justify-center">
                  {tarefa.disciplina === "Matemática" && (
                    <span className="text-xs text-orange-400">∑</span>
                  )}
                  {tarefa.disciplina === "Química" && (
                    <span className="text-xs text-orange-400">⚗️</span>
                  )}
                  {tarefa.disciplina === "Física" && (
                    <span className="text-xs text-orange-400">⚛️</span>
                  )}
                </div>
                <span className="text-orange-400 text-xs">{tarefa.disciplina}</span>
                <div className="mx-1 text-gray-500">|</div>
                <Clock className="h-3 w-3 text-red-400" />
                <span className="text-red-400 text-xs">{tarefa.vencimento}</span>
              </div>
              <div className="pl-7 pt-1">
                <div className="w-full bg-[#0D2238] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      tarefa.prioridade === "Alta" ? "bg-red-500" : "bg-yellow-500"
                    }`}
                    style={{ width: `${tarefa.progresso}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-[#0D2238]">
          <Button 
            variant="ghost" 
            className="text-gray-400 text-sm hover:text-gray-300 p-0 h-auto"
          >
            Ver tarefas concluídas
          </Button>
        </div>

        <Button 
          className="absolute bottom-4 right-4 bg-[#FF6B00] hover:bg-[#FF8C40] rounded-full h-10 w-10 p-0"
        >
          <Plus className="h-5 w-5 text-white" />
          <span className="sr-only">Nova Tarefa</span>
        </Button>
      </div>
    </div>
  );
};

export default TarefasPendentes;

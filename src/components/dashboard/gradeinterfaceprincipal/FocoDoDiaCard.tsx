
import React from "react";
import { Target, Clock, BookOpen, Play, Check, ChevronRight } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function FocoDoDiaCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";

  // Atividades de exemplo - Isso viria de uma API ou do contexto da aplicação
  const atividades = [
    {
      id: 1,
      titulo: "Assistir Aula 5: Teorema de Pitágoras",
      tipo: "video",
      tempo: "30 min",
      prazo: "Hoje, 18:00",
      urgente: true,
      concluido: false
    },
    {
      id: 2,
      titulo: "Resolver Lista de Exercícios 2",
      tipo: "exercicio",
      tempo: "45 min",
      prazo: "Hoje",
      urgente: false,
      concluido: false
    },
    {
      id: 3,
      titulo: "Revisar conteúdo da prova de amanhã",
      tipo: "revisao",
      tempo: "60 min",
      prazo: "Hoje, 22:00",
      urgente: true,
      concluido: false
    }
  ];

  // Toggle de conclusão de atividade
  const toggleAtividade = (id) => {
    // Aqui seria implementada a lógica para marcar/desmarcar atividades como concluídas
    console.log(`Atividade ${id} alterada`);
  };

  return (
    <div className={`rounded-xl overflow-hidden ${isLightMode ? 'bg-white' : 'bg-[#001e3a]'} shadow-lg ${isLightMode ? 'border border-gray-200' : 'border border-white/20'}`}>
      <div className="p-4">
        <div className="flex items-start mb-3">
          <div className={`p-2 rounded-lg ${isLightMode ? 'bg-orange-50' : 'bg-[#0A2540]/60'} ${isLightMode ? 'border border-orange-100' : 'border border-[#2A4D6E]/50'} mr-3`}>
            <Target className={`h-5 w-5 text-[#FF6B00]`} />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
              Seu Foco Hoje: <span className="font-bold">Revisão de Trigonometria</span>
            </h3>
            <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Atividades recomendadas pelo Mentor IA
            </p>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          {atividades.map((atividade) => (
            <div 
              key={atividade.id} 
              className={`flex items-start p-2 rounded-lg transition-colors ${isLightMode ? 'hover:bg-gray-50' : 'hover:bg-[#0A2540]/50'} cursor-pointer`}
            >
              <div 
                className={`h-5 w-5 rounded-full flex items-center justify-center mr-3 border ${atividade.concluido ? (isLightMode ? 'bg-[#FF6B00] border-[#FF6B00]' : 'bg-[#FF6B00] border-[#FF6B00]') : (isLightMode ? 'border-gray-300' : 'border-gray-600')}`}
                onClick={() => toggleAtividade(atividade.id)}
              >
                {atividade.concluido && <Check className="h-3 w-3 text-white" />}
              </div>

              <div className="flex-1">
                <div className="flex items-start">
                  {atividade.tipo === 'video' && <BookOpen className="h-3 w-3 mr-1 text-blue-500 mt-1" />}
                  {atividade.tipo === 'exercicio' && <Play className="h-3 w-3 mr-1 text-green-500 mt-1" />}
                  {atividade.tipo === 'revisao' && <Clock className="h-3 w-3 mr-1 text-orange-500 mt-1" />}
                  <p className={`text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                    {atividade.titulo}
                  </p>
                </div>
                <div className="flex items-center mt-1">
                  <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'} mr-3`}>
                    {atividade.tempo}
                  </span>
                  <span className={`text-xs ${atividade.urgente ? (isLightMode ? 'text-red-600' : 'text-red-400') : (isLightMode ? 'text-gray-500' : 'text-gray-400')}`}>
                    {atividade.prazo}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#FF6B00]/20 to-[#FF8C40]/20 flex items-center justify-center">
              <Target className="h-3 w-3 text-[#FF6B00]" />
            </div>
            <p className={`text-xs ml-2 ${isLightMode ? 'text-gray-500' : 'text-gray-400'} italic`}>
              Concentre-se nos exercícios práticos hoje.
            </p>
          </div>
          
          <button 
            className="rounded-md px-3 py-1.5 text-xs font-medium bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90 transition-colors flex items-center"
          >
            Iniciar Foco
            <ChevronRight className="h-3 w-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

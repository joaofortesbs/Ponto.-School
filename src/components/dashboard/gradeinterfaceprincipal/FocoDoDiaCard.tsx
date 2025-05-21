
import React, { useState } from "react";
import { Target, Clock, BookOpen, Play, Check, ChevronRight, Flame, Trophy } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export default function FocoDoDiaCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Atividades de exemplo - Isso viria de uma API ou do contexto da aplicação
  const atividades = [
    {
      id: 1,
      titulo: "Assistir Aula 5: Teorema de Pitágoras",
      tipo: "video",
      tempo: "30 min",
      prazo: "Hoje, 18:00",
      urgente: true,
      concluido: false,
      progresso: 0
    },
    {
      id: 2,
      titulo: "Resolver Lista de Exercícios 2",
      tipo: "exercicio",
      tempo: "45 min",
      prazo: "Hoje",
      urgente: false,
      concluido: false,
      progresso: 0
    },
    {
      id: 3,
      titulo: "Revisar conteúdo da prova de amanhã",
      tipo: "revisao",
      tempo: "60 min",
      prazo: "Hoje, 22:00",
      urgente: true,
      concluido: false,
      progresso: 0
    }
  ];

  // Toggle de conclusão de atividade
  const toggleAtividade = (id) => {
    // Aqui seria implementada a lógica para marcar/desmarcar atividades como concluídas
    console.log(`Atividade ${id} alterada`);
  };

  // Calcular progresso total das atividades
  const totalAtividades = atividades.length;
  const atividadesConcluidas = atividades.filter(a => a.concluido).length;
  const progressoTotal = totalAtividades > 0 ? (atividadesConcluidas / totalAtividades) * 100 : 0;

  return (
    <motion.div 
      className={`rounded-xl overflow-hidden ${isLightMode ? 'bg-white' : 'bg-gradient-to-br from-[#001e3a] to-[#00162b]'} shadow-lg ${isLightMode ? 'border border-gray-200' : 'border border-white/10'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header elegante com gradiente */}
      <div className={`p-5 ${isLightMode ? 'bg-gradient-to-r from-orange-50 to-orange-100/50' : 'bg-gradient-to-r from-[#0A2540]/80 to-[#001427]'} border-b ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg flex items-center justify-center ${isLightMode ? 'bg-white shadow-sm border border-orange-200' : 'bg-[#FF6B00]/10 border border-[#FF6B00]/30'}`}>
              <Flame className={`h-5 w-5 text-[#FF6B00]`} />
            </div>
            <div>
              <h3 className={`font-semibold text-lg ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                Seu Foco Hoje
              </h3>
              <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
                <span className="font-bold text-[#FF6B00]">Revisão de Trigonometria</span>
              </p>
            </div>
          </div>

          {/* Indicador de progresso circular */}
          <div className="hidden md:flex items-center">
            <div className="relative h-12 w-12 flex items-center justify-center">
              <svg className="absolute h-12 w-12" viewBox="0 0 44 44">
                <circle 
                  cx="22" cy="22" r="20" 
                  fill="none" 
                  stroke={isLightMode ? "#f3f4f6" : "#1e293b"} 
                  strokeWidth="4"
                />
                <circle 
                  cx="22" cy="22" r="20" 
                  fill="none" 
                  stroke="#FF6B00" 
                  strokeWidth="4"
                  strokeDasharray={126}
                  strokeDashoffset={126 - (progressoTotal / 100) * 126}
                  transform="rotate(-90 22 22)"
                  strokeLinecap="round"
                />
              </svg>
              <span className={`font-bold text-sm ${isLightMode ? 'text-gray-700' : 'text-white'}`}>
                {Math.round(progressoTotal)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="p-5">
        {/* Mensagem do mentor IA */}
        <div className={`mb-4 p-3 rounded-lg ${isLightMode ? 'bg-orange-50' : 'bg-[#FF6B00]/5'} border ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'}`}>
          <div className="flex gap-2 items-start">
            <div className={`mt-0.5 p-1.5 rounded-md ${isLightMode ? 'bg-orange-100' : 'bg-[#FF6B00]/20'}`}>
              <Target className="h-3.5 w-3.5 text-[#FF6B00]" />
            </div>
            <p className={`text-xs ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
              <span className="font-medium">Mentor IA:</span> Concentre-se nos exercícios práticos hoje. Seu desempenho em trigonometria tem mostrado melhorias!
            </p>
          </div>
        </div>

        {/* Lista de atividades */}
        <div className="space-y-2.5">
          {atividades.map((atividade, index) => (
            <motion.div 
              key={atividade.id} 
              className={`relative group flex items-start p-3 rounded-lg border ${isLightMode ? 'border-gray-100 hover:border-orange-200' : 'border-gray-700/30 hover:border-[#FF6B00]/30'} ${isLightMode ? 'hover:bg-orange-50/50' : 'hover:bg-[#FF6B00]/5'} transition-all cursor-pointer`}
              whileHover={{ y: -2 }}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Indicador de prioridade para tarefas urgentes */}
              {atividade.urgente && (
                <div className="absolute top-0 right-0">
                  <div className={`w-2 h-2 rounded-full ${isLightMode ? 'bg-red-500' : 'bg-red-400'} animate-pulse mr-1 mt-1`}></div>
                </div>
              )}
              
              <div 
                className={`h-5 w-5 rounded-full flex items-center justify-center mr-3 border ${
                  atividade.concluido 
                    ? (isLightMode ? 'bg-[#FF6B00] border-[#FF6B00]' : 'bg-[#FF6B00] border-[#FF6B00]') 
                    : (isLightMode ? 'border-gray-300 bg-white' : 'border-gray-600 bg-transparent')
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAtividade(atividade.id);
                }}
              >
                {atividade.concluido && <Check className="h-3 w-3 text-white" />}
              </div>

              <div className="flex-1">
                <div className="flex items-start gap-1.5">
                  <div className={`p-1 rounded mt-0.5 ${isLightMode ? 'bg-gray-100' : 'bg-gray-700/30'}`}>
                    {atividade.tipo === 'video' && <Play className="h-3 w-3 text-blue-500" />}
                    {atividade.tipo === 'exercicio' && <BookOpen className="h-3 w-3 text-green-500" />}
                    {atividade.tipo === 'revisao' && <Clock className="h-3 w-3 text-[#FF6B00]" />}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                      {atividade.titulo}
                    </p>
                    <div className="flex items-center mt-1.5 gap-3">
                      <span className={`text-xs flex items-center gap-1 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        <Clock className="h-3 w-3" /> {atividade.tempo}
                      </span>
                      <span className={`text-xs ${atividade.urgente ? (isLightMode ? 'text-red-600 font-medium' : 'text-red-400 font-medium') : (isLightMode ? 'text-gray-500' : 'text-gray-400')}`}>
                        {atividade.prazo}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar for individual activities */}
                <div className="mt-2">
                  <Progress value={atividade.progresso} 
                    className={`h-1 ${atividade.progresso > 0 ? "opacity-100" : "opacity-0"} ${hoverIndex === index ? "opacity-100" : ""} transition-opacity`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer com botão de ação e métricas */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/30 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-md ${isLightMode ? 'bg-orange-100' : 'bg-[#FF6B00]/20'}`}>
              <Trophy className="h-3.5 w-3.5 text-[#FF6B00]" />
            </div>
            <div>
              <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {atividadesConcluidas} de {totalAtividades} atividades
              </p>
            </div>
          </div>
          
          <motion.button 
            className={`rounded-lg px-4 py-2 text-xs font-medium bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 ${isLightMode ? '' : 'border border-[#FF6B00]/40'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Iniciar Foco
            <ChevronRight className="h-3 w-3" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

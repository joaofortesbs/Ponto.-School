import React, { useState } from "react";
import { Target, Clock, BookOpen, Play, CheckCircle, ChevronRight, Flame, Trophy } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function FocoDoDiaCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";

  // Estado para armazenar atividades - inicialmente vazio para novos usuários
  const [atividades, setAtividades] = useState<Array<{
    id: number;
    titulo: string;
    tipo: "video" | "exercicio" | "revisao" | "outro";
    tempo: string;
    prazo?: string;
    horario?: string;
    urgente: boolean;
    concluido: boolean;
    progresso?: number;
  }>>([]);

  // Estado para controlar o progresso
  const [progresso, setProgresso] = useState(0);

  // Toggle para marcar como concluído
  const toggleAtividade = (id: number) => {
    setAtividades(atividades.map(atividade => 
      atividade.id === id ? { ...atividade, concluido: !atividade.concluido } : atividade
    ));

    // Recalcular progresso
    const total = atividades.length;
    if (total === 0) return;

    const concluidas = atividades.filter(a => a.concluido).length + 
      (atividades.find(a => a.id === id)?.concluido ? -1 : 1);

    setProgresso(Math.round((concluidas / total) * 100));
  };

  // Estado para mensagem do mentor
  const [mentorMessage, setMentorMessage] = useState("");

  // Estado para o foco atual
  const [focoAtual, setFocoAtual] = useState("");

  // Estado para hover em atividades
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Renderizar o ícone adequado com base no tipo de atividade
  const renderIconByType = (tipo: string) => {
    switch (tipo) {
      case 'video':
        return <Play className="h-4 w-4 text-blue-400" />;
      case 'exercicio':
        return <BookOpen className="h-4 w-4 text-green-400" />;
      case 'revisao':
        return <Target className="h-4 w-4 text-[#FF6B00]" />;
      default:
        return <ChevronRight className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="h-full w-full rounded-xl overflow-hidden border border-[#0D2238]/30 dark:border-[#0D2238]/50 shadow-xl bg-white dark:bg-[#001427] relative flex flex-col"
    >
      {/* Header com o título do foco atual */}
      <div className="bg-gradient-to-r from-[#001427] to-[#002140] p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg flex items-center justify-center bg-[#FF6B00]/20 border border-[#FF6B00]/30">
            <Target className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg flex items-center">
              Seu Foco Hoje
            </h3>
            {focoAtual ? (
              <p className="text-[#FF6B00] text-sm font-medium">{focoAtual}</p>
            ) : (
              <p className="text-gray-300 text-sm italic">Ainda não definido</p>
            )}
          </div>
        </div>

        {/* Progresso do dia */}
        <Badge variant="outline" className="bg-[#001427]/80 text-white border-[#FF6B00]/30">
          {progresso}%
        </Badge>
      </div>

      {/* Mensagem do Mentor IA - só aparece quando houver mensagem */}
      {mentorMessage && (
        <div className="p-3 bg-gradient-to-r from-[#001F3D]/30 to-[#001F3D]/10 border-b border-[#0D2238]/30 dark:border-[#0D2238]/20">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-1">
              <div className="w-6 h-6 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/30 flex items-center justify-center">
                <span className="text-[#FF6B00] text-xs font-medium">IA</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {mentorMessage}
            </p>
          </div>
        </div>
      )}

      {/* Lista de atividades */}
      <div className="flex-1 overflow-auto">
        {atividades.length > 0 ? (
          atividades.map((atividade, index) => (
            <motion.div 
              key={atividade.id}
              className={`relative p-3 border-b border-gray-100 dark:border-[#0D2238]/20 flex items-start gap-3 ${
                atividade.concluido 
                  ? 'bg-green-50/50 dark:bg-green-900/10' 
                  : atividade.urgente 
                    ? 'bg-red-50/30 dark:bg-red-900/5' 
                    : ''
              } hover:bg-[#FF6B00]/5 transition-all cursor-pointer`}
              whileHover={{ y: -2 }}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Checkbox para marcar como concluído */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAtividade(atividade.id);
                }}
                className={`w-5 h-5 rounded-full flex-shrink-0 cursor-pointer flex items-center justify-center border ${
                  atividade.concluido 
                    ? 'bg-[#FF6B00] border-[#FF6B00] text-white' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {atividade.concluido && <CheckCircle className="h-4 w-4" />}
              </div>

              {/* Ícone do tipo de atividade */}
              <div className="p-1 rounded mt-0.5 bg-gray-100 dark:bg-gray-700/30">
                {renderIconByType(atividade.tipo)}
              </div>

              {/* Informações da atividade */}
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${
                  isLightMode ? 'text-gray-800' : 'text-white'
                } ${atividade.concluido ? 'line-through opacity-70' : ''}`}>
                  {atividade.titulo}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {atividade.tempo}
                  </span>

                  <span className={`text-xs ${
                    atividade.urgente 
                      ? 'text-red-500 dark:text-red-400 font-medium' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {atividade.prazo}
                    {atividade.horario && `, ${atividade.horario}`}
                  </span>
                </div>

                {/* Progress bar para atividades individuais, se disponível */}
                {atividade.progresso !== undefined && (
                  <div className="mt-2">
                    <div
                      className={`h-1 bg-[#FF6B00]/20 rounded-full overflow-hidden ${atividade.progresso > 0 ? "opacity-100" : "opacity-0"} ${hoverIndex === index ? "opacity-100" : ""} transition-opacity`}
                    >
                      <div
                        className="h-full bg-[#FF6B00] rounded-full"
                        style={{ width: `${atividade.progresso}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Indicador de urgência */}
              {atividade.urgente && !atividade.concluido && (
                <div className="absolute top-0 right-0">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-1 mt-1"></div>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          // Estado vazio para novos usuários
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#001F3D]/10 dark:bg-[#0D2238]/20 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-[#FF6B00]/70" />
            </div>
            <h4 className={`text-base font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>
              Ainda não há atividades
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-4">
              Suas atividades prioritárias aparecerão aqui à medida que você utiliza a plataforma.
            </p>
          </div>
        )}
      </div>

      {/* Footer com contador e botão de iniciar */}
      <div className="p-3 border-t border-gray-100 dark:border-[#0D2238]/30 flex items-center justify-between">
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 text-[#FF6B00] mr-1.5" />
          <span className="text-xs text-gray-600 dark:text-gray-300">
            {atividades.filter(a => a.concluido).length} de {atividades.length} atividades
          </span>
        </div>

        <Button 
          className="bg-[#FF6B00] hover:bg-[#FF8736] text-white rounded-lg px-4 py-1.5 text-xs font-medium flex items-center"
          onClick={() => {
            // Aqui entrará a lógica para definir ou iniciar o foco
          }}
        >
          Iniciar Foco <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}
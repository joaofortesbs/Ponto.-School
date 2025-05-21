
import React, { useState, useEffect } from "react";
import { Target, Clock, BookOpen, Play, Check, ChevronRight, Flame, Trophy, PlusCircle, Settings, X } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import DefinirFocoModal from "./DefinirFocoModal";

// Tipo para atividades
interface Atividade {
  id: number;
  titulo: string;
  tipo: "video" | "exercicio" | "revisao" | "tarefa";
  tempo: string;
  prazo: string;
  urgente: boolean;
  concluido: boolean;
  progresso: number;
}

// Tipo para os dados de foco
interface FocoDados {
  titulo: string;
  atividades: Atividade[];
  objetivo?: string;
  sugestao?: any;
  disciplinas?: any[];
  tempoEstudo?: number;
  tarefas?: any[];
  sentimento?: string;
  topicoEspecifico?: string;
  mentorMensagem?: string;
}

export default function FocoDoDiaCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [temFoco, setTemFoco] = useState<boolean>(false);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [focoDados, setFocoDados] = useState<FocoDados | null>(null);
  const [definindoFoco, setDefinindoFoco] = useState<boolean>(false);
  const [mostrarBotaoRedefinir, setMostrarBotaoRedefinir] = useState<boolean>(false);
  
  // Verificar no localStorage se há dados de foco
  useEffect(() => {
    // Simular carregamento de dados
    setCarregando(true);
    
    // Buscar do localStorage (em uma aplicação real, isso viria do backend)
    const dadosSalvos = localStorage.getItem('focoDoDia');
    
    setTimeout(() => {
      if (dadosSalvos) {
        try {
          const dados = JSON.parse(dadosSalvos);
          setFocoDados(dados);
          setAtividades(dados.atividades || []);
          setTemFoco(true);
        } catch (e) {
          console.error("Erro ao carregar dados de foco:", e);
          // Se houver erro ao carregar, limpar os dados
          localStorage.removeItem('focoDoDia');
        }
      }
      
      setCarregando(false);
    }, 1000);
  }, []);

  // Função para lidar com a conclusão de atividades
  const toggleAtividade = (id: number) => {
    // Atualizar o estado local
    const novasAtividades = atividades.map(ativ => 
      ativ.id === id ? { ...ativ, concluido: !ativ.concluido } : ativ
    );
    
    setAtividades(novasAtividades);
    
    // Atualizar os dados de foco no localStorage
    if (focoDados) {
      const novosDados = {
        ...focoDados,
        atividades: novasAtividades
      };
      
      setFocoDados(novosDados);
      localStorage.setItem('focoDoDia', JSON.stringify(novosDados));
    }
  };

  // Função para definir o foco com os dados do modal
  const definirFoco = (dados: FocoDados) => {
    setDefinindoFoco(true);
    
    // Simular processamento pelo Mentor IA
    setTimeout(() => {
      setFocoDados(dados);
      setAtividades(dados.atividades || []);
      setTemFoco(true);
      setDefinindoFoco(false);
      
      // Salvar no localStorage (em uma aplicação real, isso iria para o backend)
      localStorage.setItem('focoDoDia', JSON.stringify(dados));
    }, 500);
  };

  // Função para redefinir o foco
  const redefinirFoco = () => {
    setModalAberto(true);
  };

  // Função para iniciar o foco (abrir material ou iniciar timer)
  const iniciarFoco = () => {
    // Em uma aplicação real, isso poderia iniciar um timer Pomodoro
    // ou abrir o material relacionado à primeira atividade não concluída
    alert("Iniciando foco nas atividades selecionadas!");
  };

  // Calcular progresso total das atividades
  const totalAtividades = atividades.length;
  const atividadesConcluidas = atividades.filter(a => a.concluido).length;
  const progressoTotal = totalAtividades > 0 ? (atividadesConcluidas / totalAtividades) * 100 : 0;

  // Renderizar estado de carregamento
  if (carregando) {
    return (
      <motion.div 
        className={`rounded-xl overflow-hidden ${isLightMode ? 'bg-white' : 'bg-gradient-to-br from-[#001e3a] to-[#00162b]'} shadow-lg ${isLightMode ? 'border border-gray-200' : 'border border-white/10'} h-full`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="h-full flex items-center justify-center p-8">
          <div className="animate-pulse flex flex-col items-center space-y-4 w-full">
            <div className="w-full flex justify-between items-center">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-md w-1/3"></div>
              <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg w-full"></div>
            <div className="space-y-3 w-full">
              <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg w-full"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg w-full"></div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Renderizar estado de definição de foco
  if (definindoFoco) {
    return (
      <motion.div 
        className={`rounded-xl overflow-hidden ${isLightMode ? 'bg-white' : 'bg-gradient-to-br from-[#001e3a] to-[#00162b]'} shadow-lg ${isLightMode ? 'border border-gray-200' : 'border border-white/10'} h-full`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
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
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-5 h-[calc(100%-80px)] flex flex-col items-center justify-center">
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className={`p-4 rounded-full ${isLightMode ? 'bg-orange-100' : 'bg-[#FF6B00]/20'} mb-5`}
          >
            <Target className={`h-8 w-8 text-[#FF6B00]`} />
          </motion.div>
          
          <h3 className={`text-lg font-semibold mb-2 ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
            Organizando seu dia de estudos
          </h3>
          <p className={`text-sm text-center max-w-xs ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
            O Mentor IA está definindo suas prioridades e organizando as atividades mais relevantes...
          </p>
          
          <div className="w-full max-w-md mt-6">
            <Progress value={65} className="h-2" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div 
        className={`rounded-xl overflow-hidden ${isLightMode ? 'bg-white' : 'bg-gradient-to-br from-[#001e3a] to-[#00162b]'} shadow-lg ${isLightMode ? 'border border-gray-200' : 'border border-white/10'} h-full`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        onMouseEnter={() => setMostrarBotaoRedefinir(true)}
        onMouseLeave={() => setMostrarBotaoRedefinir(false)}
      >
        {/* Header elegante com gradiente */}
        <div className={`p-5 ${isLightMode ? 'bg-gradient-to-r from-orange-50 to-orange-100/50' : 'bg-gradient-to-r from-[#0A2540]/80 to-[#001427]'} border-b ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'} relative`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg flex items-center justify-center ${isLightMode ? 'bg-white shadow-sm border border-orange-200' : 'bg-[#FF6B00]/10 border border-[#FF6B00]/30'}`}>
                <Flame className={`h-5 w-5 text-[#FF6B00]`} />
              </div>
              <div>
                <h3 className={`font-semibold text-lg ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                  {temFoco && focoDados ? `Seu Foco Hoje` : `Seu Foco Hoje`}
                </h3>
                {temFoco && focoDados && (
                  <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
                    <span className="font-bold text-[#FF6B00]">{focoDados.titulo}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Indicador de progresso circular - mostrado apenas se houver atividades */}
            {totalAtividades > 0 && (
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
            )}
          </div>
          
          {/* Botão de redefinir - visível apenas ao passar o mouse sobre o card */}
          <AnimatePresence>
            {temFoco && mostrarBotaoRedefinir && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className={`absolute top-2 right-2 p-1.5 rounded-full ${isLightMode ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800/50 hover:bg-gray-700/70'} transition-colors`}
                onClick={redefinirFoco}
                title="Redefinir foco"
              >
                <Settings className={`h-3.5 w-3.5 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Conteúdo principal */}
        <div className="p-5">
          {/* Mensagem de boas-vindas para novos usuários */}
          {!temFoco && (
            <div className={`mb-4 p-3 rounded-lg ${isLightMode ? 'bg-orange-50' : 'bg-[#FF6B00]/5'} border ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'}`}>
              <div className="flex gap-2 items-start">
                <div className={`mt-0.5 p-1.5 rounded-md ${isLightMode ? 'bg-orange-100' : 'bg-[#FF6B00]/20'}`}>
                  <Target className="h-3.5 w-3.5 text-[#FF6B00]" />
                </div>
                <p className={`text-xs ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                  <span className="font-medium">Mentor IA:</span> Bem-vindo! Aqui você poderá definir e acompanhar suas atividades diárias prioritárias. Comece definindo seu foco de estudos.
                </p>
              </div>
            </div>
          )}
          
          {/* Mensagem personalizada do Mentor IA para o foco definido */}
          {temFoco && focoDados && focoDados.mentorMensagem && (
            <div className={`mb-4 p-3 rounded-lg ${isLightMode ? 'bg-orange-50' : 'bg-[#FF6B00]/5'} border ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'}`}>
              <div className="flex gap-2 items-start">
                <div className={`mt-0.5 p-1.5 rounded-md ${isLightMode ? 'bg-orange-100' : 'bg-[#FF6B00]/20'}`}>
                  <Target className="h-3.5 w-3.5 text-[#FF6B00]" />
                </div>
                <p className={`text-xs ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                  <span className="font-medium">Mentor IA:</span> {focoDados.mentorMensagem || "Concentre-se nos exercícios práticos hoje. Seu desempenho em trigonometria tem mostrado melhoras!"}
                </p>
              </div>
            </div>
          )}

          {/* Estado vazio - Sem atividades */}
          {!temFoco ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className={`p-3 rounded-full ${isLightMode ? 'bg-orange-50' : 'bg-[#FF6B00]/10'}`}>
                <Clock className={`h-6 w-6 text-[#FF6B00]`} />
              </div>
              <div className="text-center space-y-2">
                <h4 className={`text-sm font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                  Nenhuma atividade definida
                </h4>
                <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'} max-w-xs`}>
                  Defina um foco de estudo e adicione atividades para organizar seu dia.
                </p>
              </div>
            </div>
          ) : (
            /* Lista de atividades - Visível apenas quando houver atividades */
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
                        {atividade.tipo === 'tarefa' && <Check className="h-3 w-3 text-purple-500" />}
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
                      <Progress 
                        value={atividade.progresso} 
                        className={`h-1 ${atividade.progresso > 0 ? "opacity-100" : "opacity-0"} ${hoverIndex === index ? "opacity-100" : ""} transition-opacity`} 
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Footer com botão de ação e métricas */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/30 flex justify-between items-center">
            {atividades.length > 0 ? (
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
            ) : (
              <div></div> // Espaçador para manter o layout com justify-between
            )}
            
            <motion.button 
              className={`rounded-lg px-4 py-2 text-xs font-medium bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 ${isLightMode ? '' : 'border border-[#FF6B00]/40'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={temFoco ? iniciarFoco : () => setModalAberto(true)}
            >
              {temFoco ? "Iniciar Foco" : "Definir Foco"}
              <ChevronRight className="h-3 w-3" />
            </motion.button>
          </div>
        </div>
      </motion.div>
      
      {/* Modal para definir foco */}
      <DefinirFocoModal
        open={modalAberto}
        onOpenChange={setModalAberto}
        onDefinirFoco={definirFoco}
      />
    </>
  );
}

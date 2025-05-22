
import React, { useState, useEffect } from "react";
import { Target, Clock, BookOpen, Play, Check, ChevronRight, Flame, Trophy, PlusCircle, Settings, Smile, HelpCircle, BarChart2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import DefinirFocoModal, { FocoData } from "./DefinirFocoModal";

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

interface FocoPrincipal {
  titulo: string;
  descricao: string;
  disciplinas: string[];
  tempoTotal: string;
  dicaMentor?: string;
  sentimento?: string;
}

export default function FocoDoDiaCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [focoPrincipal, setFocoPrincipal] = useState<FocoPrincipal | null>(null);
  const [temFoco, setTemFoco] = useState<boolean>(false);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [gerando, setGerando] = useState<boolean>(false);

  // Simular carregamento de dados
  useEffect(() => {
    // Aqui faremos uma simulação de carregamento de dados
    // No futuro, isso seria substituído por chamadas reais à API
    const timeout = setTimeout(() => {
      setCarregando(false);

      // Verificar se temos dados do foco salvos no localStorage
      const focoDadosSalvos = localStorage.getItem('focoDia');
      if (focoDadosSalvos) {
        try {
          const dados = JSON.parse(focoDadosSalvos);
          setFocoPrincipal(dados.focoPrincipal);
          setAtividades(dados.atividades);
          setTemFoco(true);
        } catch (error) {
          console.error("Erro ao carregar dados do foco:", error);
        }
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  // Função para lidar com a conclusão de atividades
  const toggleAtividade = (id: number) => {
    // Atualizar o estado local - em uma aplicação real, isto também atualizaria o backend
    const atualizadas = atividades.map(ativ => 
      ativ.id === id ? { ...ativ, concluido: !ativ.concluido } : ativ
    );

    setAtividades(atualizadas);

    // Atualizar no localStorage
    if (focoPrincipal) {
      localStorage.setItem('focoDia', JSON.stringify({
        focoPrincipal,
        atividades: atualizadas
      }));
    }
  };

  // Função para processar dados do modal e gerar o foco
  const processarDefinicaoFoco = (dados: FocoData) => {
    setModalAberto(false);
    setGerando(true);

    // Simulando processamento pelo backend/IA
    setTimeout(() => {
      // Criar foco principal baseado nos dados recebidos
      const novoFocoPrincipal: FocoPrincipal = {
        titulo: dados.objetivo,
        descricao: dados.objetivoPersonalizado || dados.objetivo,
        disciplinas: dados.disciplinas,
        tempoTotal: `${Math.round(dados.tempoEstudo / 60)} hora${dados.tempoEstudo >= 120 ? 's' : ''}`,
        dicaMentor: gerarDicaMentor(dados.estado),
        sentimento: dados.estado
      };

      // Gerar atividades baseadas nas informações
      const novasAtividades = gerarAtividades(dados);

      // Atualizar estados
      setFocoPrincipal(novoFocoPrincipal);
      setAtividades(novasAtividades);
      setTemFoco(true);
      setGerando(false);

      // Salvar no localStorage
      localStorage.setItem('focoDia', JSON.stringify({
        focoPrincipal: novoFocoPrincipal,
        atividades: novasAtividades
      }));
    }, 2000);
  };

  // Função para gerar dica baseada no estado emocional
  const gerarDicaMentor = (estado: string): string => {
    const dicas = {
      "Motivado(a)": "Aproveite seu ânimo atual para focar nos tópicos mais desafiadores primeiro!",
      "Um pouco perdido(a)": "Divida seu estudo em etapas menores e comemore cada progresso.",
      "Cansado(a)": "Alterne entre tópicos diferentes a cada 30 minutos para manter o foco.",
      "Ansioso(a)": "Pratique 2 minutos de respiração profunda antes de cada sessão de estudo."
    };

    return dicas[estado as keyof typeof dicas] || "Estabeleça pequenas metas e celebre cada conquista no seu estudo.";
  };

  // Função para gerar atividades com base nos dados do formulário
  const gerarAtividades = (dados: FocoData): Atividade[] => {
    const tiposAtividade: ("video" | "exercicio" | "revisao" | "tarefa")[] = ["video", "exercicio", "revisao", "tarefa"];

    // Se o usuário selecionou tarefas específicas, incluí-las
    const atividadesTarefas = dados.tarefasSelecionadas.map((tarefa, index) => ({
      id: Date.now() + index,
      titulo: tarefa,
      tipo: "tarefa" as const,
      tempo: `${Math.floor(Math.random() * 30) + 15}min`,
      prazo: ["hoje", "amanhã", "esta semana"][Math.floor(Math.random() * 3)],
      urgente: Math.random() > 0.7,
      concluido: false,
      progresso: 0
    }));

    // Gerar atividades extras com base nas disciplinas
    const atividadesExtra = dados.disciplinas.slice(0, 3).map((disciplina, index) => {
      const tipo = tiposAtividade[Math.floor(Math.random() * tiposAtividade.length)];
      const titulos = {
        video: [`Assistir vídeo de ${disciplina}`, `Aula sobre conceitos de ${disciplina}`],
        exercicio: [`Exercícios de ${disciplina}`, `Resolver problemas de ${disciplina}`],
        revisao: [`Revisar anotações de ${disciplina}`, `Resumo do capítulo de ${disciplina}`],
        tarefa: [`Trabalho de ${disciplina}`, `Projeto de ${disciplina}`]
      };

      return {
        id: Date.now() + atividadesTarefas.length + index,
        titulo: titulos[tipo][Math.floor(Math.random() * 2)],
        tipo,
        tempo: `${Math.floor(Math.random() * 45) + 15}min`,
        prazo: ["hoje", "amanhã", "esta semana"][Math.floor(Math.random() * 3)],
        urgente: Math.random() > 0.7,
        concluido: false,
        progresso: 0
      };
    });

    // Combinar todas as atividades e limitar a 4 no máximo
    return [...atividadesTarefas, ...atividadesExtra].slice(0, 4);
  };

  // Função para reiniciar o foco
  const redefinirFoco = () => {
    setModalAberto(true);
  };

  // Calcular progresso total das atividades
  const totalAtividades = atividades.length;
  const atividadesConcluidas = atividades.filter(a => a.concluido).length;
  const progressoTotal = totalAtividades > 0 ? (atividadesConcluidas / totalAtividades) * 100 : 0;
  const progressoAtividades = totalAtividades > 0 
    ? Math.round((atividadesConcluidas / totalAtividades) * 100) 
    : 0;

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

  // Renderizar estado de geração de foco
  if (gerando) {
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
                <Flame className={`h-5 w-5 text-[#FF6B00] animate-pulse`} />
              </div>
              <div>
                <h3 className={`font-semibold text-lg ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                  Seu Foco Hoje
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="h-full p-8 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className={`p-3 rounded-full ${isLightMode ? 'bg-orange-100' : 'bg-[#FF6B00]/20'}`}>
              <motion.div
                animate={{
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Clock className={`h-6 w-6 text-[#FF6B00]`} />
              </motion.div>
            </div>
            <div className="text-center space-y-2">
              <h4 className={`text-sm font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                Organizando seu dia...
              </h4>
              <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'} max-w-xs`}>
                O Mentor IA está analisando suas preferências e criando seu plano de estudos personalizado.
              </p>
            </div>

            <div className="w-full max-w-xs mt-4">
              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#FF6B00]"
                  animate={{
                    width: ['0%', '100%']
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`rounded-xl overflow-hidden ${isLightMode ? 'bg-white' : 'bg-gradient-to-br from-[#001e3a] to-[#00162b]'} shadow-lg ${isLightMode ? 'border border-gray-200' : 'border border-white/10'} h-full`}
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
              {temFoco && focoPrincipal && (
                <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
                  <span className="font-bold text-[#FF6B00]">
                    {focoPrincipal.titulo}
                  </span>
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
      </div>

      {/* Conteúdo principal */}
      <div className="p-5">
        {/* Exibir foco principal quando definido */}
        {temFoco && focoPrincipal ? (
          <>
            {/* Informações do foco principal */}
            <div className={`mb-4 p-3 rounded-lg ${isLightMode ? 'bg-orange-50' : 'bg-[#FF6B00]/5'} border ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'}`}>
              <div className="flex gap-2 items-start">
                <div className={`mt-0.5 p-1.5 rounded-md ${isLightMode ? 'bg-orange-100' : 'bg-[#FF6B00]/20'}`}>
                  <Target className="h-3.5 w-3.5 text-[#FF6B00]" />
                </div>
                <div>
                  <p className={`text-xs ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                    <span className="font-medium">Foco principal:</span> {focoPrincipal.descricao}
                  </p>
                  {focoPrincipal.disciplinas.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {focoPrincipal.disciplinas.map((disciplina, idx) => (
                        <span 
                          key={idx} 
                          className={`text-xs px-2 py-0.5 rounded-full ${isLightMode ? 'bg-blue-100 text-blue-700' : 'bg-blue-900/30 text-blue-400'}`}
                        >
                          {disciplina}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botão de configurações para redefinir foco */}
            <div className="absolute top-5 right-5">
              <button 
                onClick={redefinirFoco}
                className={`p-1.5 rounded-full ${isLightMode ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'} transition-colors`}
              >
                <Settings className={`h-3.5 w-3.5 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`} />
              </button>
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
                      <Progress value={atividade.progresso} 
                        className={`h-1 ${atividade.progresso > 0 ? "opacity-100" : "opacity-0"} ${hoverIndex === index ? "opacity-100" : ""} transition-opacity`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Dica do Mentor IA no final do card */}
            {focoPrincipal.dicaMentor && (
              <div className={`mt-4 p-3 rounded-lg ${isLightMode ? 'bg-green-50' : 'bg-green-900/10'} border ${isLightMode ? 'border-green-100' : 'border-green-800/30'}`}>
                <div className="flex gap-2 items-start">
                  <div className={`mt-0.5 p-1.5 rounded-md ${isLightMode ? 'bg-green-100' : 'bg-green-800/30'}`}>
                    <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className={`text-xs ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                    <span className="font-medium">Dica do Mentor:</span> {focoPrincipal.dicaMentor}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Mensagem de boas-vindas para novos usuários */}
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

            {/* Estado vazio - Sem atividades */}
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
          </>
        )}

        {/* Footer com botão de ação e métricas */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/30 flex justify-between items-center relative">
          {atividades.length > 0 ? (
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full border ${isLightMode ? 'border-gray-300 bg-white' : 'border-gray-600 bg-transparent'} flex items-center justify-center`}>
                <span className={`text-xs font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  {atividadesConcluidas}
                </span>
              </div>
              <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {atividadesConcluidas} de {totalAtividades} atividades
              </span>
            </div>
          ) : (
            <div></div> // Espaçador para manter o layout com justify-between
          )}

          <motion.button 
            onClick={() => setModalAberto(true)}
            className={`rounded-lg px-4 py-2 text-xs font-medium bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 ${isLightMode ? '' : 'border border-[#FF6B00]/40'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {atividades.length > 0 ? "Iniciar Foco" : "Definir Foco"}
            <ChevronRight className="h-3 w-3" />
          </motion.button>

          {/* Exibir sentimento quando disponível */}
            {temFoco && focoPrincipal?.sentimento && (
              <div className="absolute top-2 right-2">
                <div className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full flex items-center gap-1">
                  {focoPrincipal.sentimento === "Motivado(a)" && <Smile className="h-3 w-3" />}
                  {focoPrincipal.sentimento === "Um pouco perdido(a)" && <HelpCircle className="h-3 w-3" />}
                  {focoPrincipal.sentimento === "Cansado(a)" && <Clock className="h-3 w-3" />}
                  {focoPrincipal.sentimento === "Ansioso(a)" && <BarChart2 className="h-3 w-3" />}
                  <span>{focoPrincipal.sentimento}</span>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Modal para definir o foco */}
      <AnimatePresence>
        {modalAberto && (
          <DefinirFocoModal 
            open={modalAberto}
            onClose={() => setModalAberto(false)}
            onSave={processarDefinicaoFoco}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

import React, { useState, useEffect } from "react";
import { Flame, Award, TrendingUp, ExternalLink, Star, Zap, Trophy, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";

// Interface para o tipo de evento de streak futuramente
interface StreakEvent {
  type: 'login' | 'study' | 'task' | 'challenge';
  date: Date;
  duration?: number;
}

export default function SequenciaEstudosCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  
  // Estados para guardar os dados do usuário
  const [diasConsecutivos, setDiasConsecutivos] = useState<number>(0);
  const [recordeDias, setRecordeDias] = useState<number>(0);
  const [diasParaProximoNivel, setDiasParaProximoNivel] = useState<number>(3);
  const [metaDiaria, setMetaDiaria] = useState<number>(5);
  const [proximaRecompensa, setProximaRecompensa] = useState<string>("Badge Iniciante");
  const [streakEvents, setStreakEvents] = useState<StreakEvent[]>([]);
  
  // Função para carregar dados do usuário
  const carregarDadosUsuario = () => {
    // Aqui você poderá buscar dados reais do backend no futuro
    // Por enquanto, vamos verificar se existem dados salvos localmente
    const dadosSalvos = localStorage.getItem('streakData');
    
    if (dadosSalvos) {
      try {
        const dados = JSON.parse(dadosSalvos);
        setDiasConsecutivos(dados.diasConsecutivos || 0);
        setRecordeDias(dados.recordeDias || 0);
        setDiasParaProximoNivel(dados.diasParaProximoNivel || 3);
        setMetaDiaria(dados.metaDiaria || 5);
        setProximaRecompensa(dados.proximaRecompensa || "Badge Iniciante");
        setStreakEvents(dados.eventos || []);
      } catch (error) {
        console.error("Erro ao carregar dados da sequência:", error);
      }
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  // Cálculo da porcentagem de progresso para o próximo nível
  const calcularProgresso = () => {
    if (diasConsecutivos === 0 && diasParaProximoNivel === 0) return 0;
    const progresso = (diasConsecutivos / (diasConsecutivos + diasParaProximoNivel)) * 100;
    return Math.min(progresso, 100);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="h-full w-full rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl bg-white dark:bg-gradient-to-br dark:from-[#0c1425] dark:to-[#0a1a2e] relative flex flex-col"
    >
      {/* Elementos decorativos de fundo - removidos efeitos de blur e grade */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Partículas decorativas */}
        <div className="absolute top-1/4 right-10 w-2 h-2 bg-[#FF6B00]/40 rounded-full"></div>
        <div className="absolute top-1/3 left-10 w-3 h-3 bg-blue-400/30 dark:bg-blue-400/20 rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-purple-400/30 dark:bg-purple-400/20 rounded-full"></div>
      </div>

      {/* Header elegante com gradiente - estilo igual ao FocoDoDiaCard */}
      <div className={`p-5 ${isLightMode ? 'bg-gradient-to-r from-orange-50 to-orange-100/50' : 'bg-gradient-to-r from-[#0A2540]/80 to-[#001427]'} border-b ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg flex items-center justify-center ${isLightMode ? 'bg-white shadow-sm border border-orange-200' : 'bg-[#FF6B00]/10 border border-[#FF6B00]/30'}`}>
              <Flame className={`h-5 w-5 text-[#FF6B00]`} />
            </div>
            <div>
              <h3 className={`font-semibold text-lg ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                Sua Sequência de Estudos
              </h3>
              <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
                <span className="font-medium">{diasConsecutivos} dias consecutivos</span>
              </p>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-xs font-medium ${isLightMode ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
          >
            <span>Detalhes</span>
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* Conteúdo principal com design premium */}
      <div className="p-6 relative z-10 flex flex-col h-[calc(100%-76px)] justify-between">
        {diasConsecutivos === 0 ? (
          // Estado inicial para novos usuários
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="relative mb-6">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#FF6B00]/20 to-[#FF8C40]/20 blur-md"></div>
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#FF6B00]/50 to-[#FF8C40]/50 flex items-center justify-center relative">
                <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-[#FF6B00]/30 to-[#FF8C40]/30 opacity-50"></div>
                <Flame className="h-10 w-10 text-white/70 drop-shadow-md relative z-10" />
              </div>
            </div>
            <h4 className={`font-semibold text-lg mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-100'}`}>
              Comece sua jornada!
            </h4>
            <p className={`text-sm max-w-[230px] mb-4 ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
              Acesse a plataforma regularmente para construir sua sequência de estudos
            </p>
            <div className="flex items-center space-x-1.5 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#14253d]/50 px-3 py-1.5 rounded-full">
              <Clock className="h-3.5 w-3.5 text-[#FF6B00]" />
              <span className="text-xs">Próximo registro em 24h</span>
            </div>
          </div>
        ) : (
          // Interface com dados do usuário quando existirem
          <>
            {/* Contador principal estilizado */}
            <div className="flex flex-col items-center mb-5 relative">
              {/* Efeito de brilho animado ao redor do ícone */}
              <motion.div 
                initial={{ opacity: 0.6, scale: 0.9 }}
                animate={{ 
                  opacity: [0.6, 0.8, 0.6], 
                  scale: [0.9, 1.1, 0.9],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -inset-2 rounded-full bg-gradient-to-r from-[#FF6B00]/20 to-[#FF8C40]/20 blur-xl"
              />

              {/* Ícone principal com design premium */}
              <div className="relative mb-4">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#FF6B00]/20 to-[#FF8C40]/20 blur-md"></div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center justify-center relative">
                  <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] opacity-50"></div>
                  <Flame className="h-10 w-10 text-white drop-shadow-md relative z-10" />
                </div>

                {/* Indicador de streak com borda animada */}
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-[#14253d] flex items-center justify-center shadow-lg border border-[#FF6B00]/20"
                >
                  <Zap className="h-4 w-4 text-[#FF6B00]" />
                </motion.div>
              </div>

              {/* Contador de dias em design premium */}
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Sua sequência atual</p>
                <div className="flex items-center justify-center">
                  <p className="text-5xl font-bold bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-transparent bg-clip-text">{diasConsecutivos}</p>
                  <p className="text-lg font-medium text-gray-400 dark:text-gray-500 ml-1 mt-2">dias</p>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 font-medium">
                  estudando consecutivamente
                </p>
              </div>
            </div>

            {/* Seção de informações adicionais com design premium */}
            <div className="space-y-5 mt-2">
              {/* Progresso para o próximo nível com gradiente premium */}
              <div className="bg-gray-50 dark:bg-[#14253d]/80 rounded-lg p-3.5 backdrop-blur-sm border border-gray-100 dark:border-gray-800/80">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <Trophy className="h-3.5 w-3.5 text-[#FF6B00]" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Próximo nível</span>
                  </div>
                  <span className="text-xs font-semibold text-[#FF6B00] bg-[#FF6B00]/10 px-2 py-0.5 rounded-full">+{diasParaProximoNivel} dias</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] relative"
                    style={{ width: `${calcularProgresso()}%` }}
                  >
                    <motion.div 
                      className="absolute top-0 right-0 h-full w-2 bg-white/50"
                      initial={{ x: -20 }}
                      animate={{ x: 20 }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Estatísticas em design de cartões grid */}
              <div className="grid grid-cols-2 gap-2">
                {/* Card de Recorde */}
                <div className="bg-gray-50 dark:bg-[#14253d]/80 rounded-lg py-2.5 px-3 backdrop-blur-sm border border-gray-100 dark:border-gray-800/80 flex flex-col items-center justify-center">
                  <div className="flex items-center space-x-1 mb-1">
                    <Award className="h-3.5 w-3.5 text-yellow-500" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Seu recorde</span>
                  </div>
                  <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{recordeDias}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">dias</p>
                </div>

                {/* Card de Meta Diária */}
                <div className="bg-gray-50 dark:bg-[#14253d]/80 rounded-lg py-2.5 px-3 backdrop-blur-sm border border-gray-100 dark:border-gray-800/80 flex flex-col items-center justify-center">
                  <div className="flex items-center space-x-1 mb-1">
                    <Star className="h-3.5 w-3.5 text-[#FF8C40]" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Meta diária</span>
                  </div>
                  <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{metaDiaria}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">dias</p>
                </div>
              </div>

              {/* Próxima recompensa com design premium */}
              <div className="bg-gray-50 dark:bg-[#14253d]/80 rounded-lg p-3 backdrop-blur-sm border border-gray-100 dark:border-gray-800/80">
                <div className="flex items-center justify-center space-x-1.5 mb-2">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Próxima recompensa</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="bg-gradient-to-r from-[#FF6B00]/10 to-[#FF8C40]/10 rounded-full p-1">
                    <Trophy className="h-4 w-4 text-[#FF6B00]" />
                  </div>
                  <span className="text-sm font-semibold bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-transparent bg-clip-text">
                    {proximaRecompensa}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
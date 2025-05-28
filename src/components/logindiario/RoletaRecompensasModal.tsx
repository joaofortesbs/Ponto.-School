
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Gift, Star, Flame, Eye, Zap, Trophy, Sparkles, Users, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

interface Recompensa {
  id: string;
  nome: string;
  valor: number;
  tipo: "pontos" | "xp" | "moldura" | "badge" | "desconto" | "boost";
  probabilidade: number;
  icone: string;
  cor: string;
}

interface RoletaRecompensasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const recompensas: Recompensa[] = [
  { id: "1", nome: "5 SP", valor: 5, tipo: "pontos", probabilidade: 30, icone: "💰", cor: "#3B82F6" },
  { id: "2", nome: "10 SP", valor: 10, tipo: "pontos", probabilidade: 25, icone: "💰", cor: "#3B82F6" },
  { id: "3", nome: "15 SP", valor: 15, tipo: "pontos", probabilidade: 20, icone: "💰", cor: "#3B82F6" },
  { id: "4", nome: "10 XP", valor: 10, tipo: "xp", probabilidade: 15, icone: "⭐", cor: "#FF6B00" },
  { id: "5", nome: "Badge Diário", valor: 1, tipo: "badge", probabilidade: 7, icone: "🏆", cor: "#8B5CF6" },
  { id: "6", nome: "+5% XP (1h)", valor: 1, tipo: "boost", probabilidade: 2, icone: "⚡", cor: "#10B981" },
  { id: "7", nome: "25 SP", valor: 25, tipo: "pontos", probabilidade: 1, icone: "💎", cor: "#F59E0B" },
];

const RoletaRecompensasModal: React.FC<RoletaRecompensasModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedReward, setSelectedReward] = useState<Recompensa | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [diasConsecutivos, setDiasConsecutivos] = useState(0);
  const [proximoGiroEm, setProximoGiroEm] = useState({ horas: 0, minutos: 0, segundos: 0 });
  const [giroDisponivel, setGiroDisponivel] = useState(true);
  const [showChances, setShowChances] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          
          // Verificar se já fez login hoje
          const today = new Date().toISOString().split('T')[0];
          const { data: streakData } = await supabase
            .from('user_streak')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (streakData) {
            setDiasConsecutivos(streakData.consecutive_days || 0);
            
            // Verificar se já fez login hoje
            const lastLoginDate = new Date(streakData.last_login_date).toISOString().split('T')[0];
            if (lastLoginDate === today) {
              setGiroDisponivel(false);
              // Calcular tempo até próximo giro (meia-noite)
              const now = new Date();
              const tomorrow = new Date(now);
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(0, 0, 0, 0);
              const diff = tomorrow.getTime() - now.getTime();
              
              const hours = Math.floor(diff / (1000 * 60 * 60));
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((diff % (1000 * 60)) / 1000);
              
              setProximoGiroEm({ horas: hours, minutos: minutes, segundos: seconds });
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  // Timer para próximo giro
  useEffect(() => {
    if (!giroDisponivel) {
      const timer = setInterval(() => {
        setProximoGiroEm(prev => {
          let { horas, minutos, segundos } = prev;
          
          if (segundos > 0) {
            segundos--;
          } else if (minutos > 0) {
            minutos--;
            segundos = 59;
          } else if (horas > 0) {
            horas--;
            minutos = 59;
            segundos = 59;
          } else {
            setGiroDisponivel(true);
            return { horas: 0, minutos: 0, segundos: 0 };
          }
          
          return { horas, minutos, segundos };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [giroDisponivel]);

  const salvarRecompensa = async (recompensa: Recompensa) => {
    if (!userId) return;

    try {
      // Atualizar pontos do usuário
      if (recompensa.tipo === "pontos") {
        const { data: profile } = await supabase
          .from('profiles')
          .select('school_points')
          .eq('id', userId)
          .single();

        const currentPoints = profile?.school_points || 0;
        await supabase
          .from('profiles')
          .update({ school_points: currentPoints + recompensa.valor })
          .eq('id', userId);
      }

      // Salvar histórico de recompensa
      await supabase
        .from('user_daily_rewards')
        .insert({
          user_id: userId,
          reward_type: recompensa.tipo,
          reward_value: recompensa.valor,
          reward_name: recompensa.nome,
          date: new Date().toISOString().split('T')[0]
        });

      // Atualizar streak
      const today = new Date().toISOString().split('T')[0];
      const { data: streakData } = await supabase
        .from('user_streak')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (streakData) {
        await supabase
          .from('user_streak')
          .update({
            last_login_date: today,
            consecutive_days: diasConsecutivos + 1
          })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('user_streak')
          .insert({
            user_id: userId,
            last_login_date: today,
            consecutive_days: 1
          });
      }

      setDiasConsecutivos(prev => prev + 1);
      
    } catch (error) {
      console.error('Erro ao salvar recompensa:', error);
    }
  };

  const girarRoleta = async () => {
    if (!giroDisponivel || isSpinning || !userId) return;

    setIsSpinning(true);
    
    // Selecionar recompensa baseada na probabilidade
    const rand = Math.random() * 100;
    let accumulator = 0;
    let selectedRecompensa = recompensas[0];
    
    for (const recompensa of recompensas) {
      accumulator += recompensa.probabilidade;
      if (rand <= accumulator) {
        selectedRecompensa = recompensa;
        break;
      }
    }

    // Calcular rotação para parar na recompensa selecionada
    const segmentAngle = 360 / recompensas.length;
    const selectedIndex = recompensas.findIndex(r => r.id === selectedRecompensa.id);
    const targetAngle = selectedIndex * segmentAngle;
    const fullRotations = 5; // 5 voltas completas
    const finalRotation = fullRotations * 360 + targetAngle;

    setRotation(finalRotation);

    // Depois da animação, mostrar resultado
    setTimeout(async () => {
      setIsSpinning(false);
      setSelectedReward(selectedRecompensa);
      setShowRewardModal(true);
      setGiroDisponivel(false);
      
      // Salvar recompensa no banco
      await salvarRecompensa(selectedRecompensa);
      
      // Calcular próximo giro (24h)
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setProximoGiroEm({ horas: hours, minutos: minutes, segundos: seconds });
    }, 3000);
  };

  const fecharRewardModal = () => {
    setShowRewardModal(false);
    setSelectedReward(null);
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-900">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">Carregando...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl">
          {/* Header Sofisticado */}
          <DialogHeader className="relative border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 via-white to-orange-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 p-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center relative"
            >
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#FF6B00] bg-clip-text text-transparent relative z-10 flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-8 w-8 text-[#3B82F6]" />
                </motion.div>
                RECOMPENSA DIÁRIA
                <motion.div
                  animate={{ rotate: [360, 0] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                >
                  <Trophy className="h-8 w-8 text-[#FF6B00]" />
                </motion.div>
              </DialogTitle>
            </motion.div>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-10 w-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-600"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </Button>
          </DialogHeader>

          <div className="flex flex-col lg:flex-row gap-8 p-8">
            {/* Área Central - Roleta e Controles */}
            <div className="flex-1 flex flex-col items-center space-y-8">
              {/* Sequência de Dias Consecutivos */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <div className="bg-gradient-to-r from-blue-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-4">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Flame className="h-8 w-8 text-[#FF6B00]" />
                    </motion.div>
                    <div className="text-center">
                      <div className="text-4xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#FF6B00] bg-clip-text text-transparent">
                        {diasConsecutivos}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                        {diasConsecutivos === 0 ? "INICIE SUA SEQUÊNCIA" : "DIAS CONSECUTIVOS"}
                      </div>
                    </div>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Zap className="h-8 w-8 text-[#3B82F6]" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Roleta Tecnológica */}
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-orange-400/20 dark:from-blue-600/30 dark:via-purple-600/30 dark:to-orange-600/30 rounded-full blur-2xl scale-110"></div>
                
                <motion.div
                  className="relative w-96 h-96 rounded-full border-4 border-gray-300 dark:border-gray-600 overflow-hidden shadow-2xl bg-white dark:bg-gray-800"
                  style={{
                    background: `conic-gradient(${recompensas.map((_, index) => 
                      `${index % 2 === 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.9)'} ${(index * 360 / recompensas.length)}deg ${((index + 1) * 360 / recompensas.length)}deg`
                    ).join(', ')})`
                  }}
                  animate={{ rotate: rotation }}
                  transition={{ 
                    duration: isSpinning ? 3 : 0,
                    ease: isSpinning ? "easeOut" : "linear"
                  }}
                >
                  {/* Segmentos da Roleta */}
                  {recompensas.map((recompensa, index) => {
                    const angle = (360 / recompensas.length) * index;
                    return (
                      <div
                        key={recompensa.id}
                        className="absolute w-full h-full flex items-center justify-center"
                        style={{
                          transform: `rotate(${angle + 360 / recompensas.length / 2}deg)`,
                          transformOrigin: 'center'
                        }}
                      >
                        <div className="absolute top-8 text-3xl transform -rotate-90">
                          {recompensa.icone}
                        </div>
                        <div className="absolute top-20 text-xs text-gray-700 dark:text-gray-300 font-bold transform -rotate-90 whitespace-nowrap">
                          {recompensa.nome}
                        </div>
                      </div>
                    );
                  })}

                  {/* Centro da Roleta */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#3B82F6] to-[#FF6B00] rounded-full flex items-center justify-center border-4 border-white dark:border-gray-200 shadow-xl">
                      <Star className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </motion.div>

                {/* Ponteiro Tecnológico */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[40px] border-l-transparent border-r-transparent border-b-[#3B82F6] shadow-lg"></div>
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#3B82F6] rounded-full border-2 border-white dark:border-gray-200"></div>
                </div>
              </div>

              {/* Botão Ver Chances */}
              <Button
                variant="ghost"
                size="sm"
                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl backdrop-blur-sm"
                onClick={() => setShowChances(!showChances)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showChances ? "Ocultar Probabilidades" : "Ver Probabilidades"}
              </Button>
            </div>

            {/* Painel Lateral Direito */}
            <div className="w-full lg:w-96 space-y-6">
              {/* Status do Próximo Giro */}
              {!giroDisponivel && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Clock className="h-6 w-6 text-[#3B82F6]" />
                    <span className="text-gray-700 dark:text-gray-300 font-bold">PRÓXIMO GIRO EM:</span>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-mono font-bold bg-gradient-to-r from-[#3B82F6] to-[#FF6B00] bg-clip-text text-transparent">
                      {String(proximoGiroEm.horas).padStart(2, '0')}:
                      {String(proximoGiroEm.minutos).padStart(2, '0')}:
                      {String(proximoGiroEm.segundos).padStart(2, '0')}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Recompensas em Destaque */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-gray-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 backdrop-blur-sm"
              >
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 text-center flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5 text-[#FF6B00]" />
                  RECOMPENSAS DISPONÍVEIS
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {recompensas.slice(0, 4).map((recompensa, index) => (
                    <motion.div
                      key={recompensa.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-600 shadow-sm"
                    >
                      <div className="text-2xl mb-2">{recompensa.icone}</div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 font-semibold">{recompensa.nome}</div>
                      <div className="text-xs text-[#3B82F6] mt-1">{recompensa.probabilidade}%</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Botões de Ação */}
              <div className="space-y-4">
                <Button
                  onClick={girarRoleta}
                  disabled={!giroDisponivel || isSpinning}
                  className="w-full h-16 bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#FF6B00] hover:from-[#2563EB] hover:via-[#4F46E5] hover:to-[#EA580C] text-white font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl shadow-2xl border-2 border-blue-200 dark:border-blue-800 transition-all duration-300 transform hover:scale-105"
                >
                  {isSpinning ? (
                    <motion.div
                      className="flex items-center gap-3"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Gift className="h-6 w-6" />
                      <span>GIRANDO...</span>
                    </motion.div>
                  ) : giroDisponivel ? (
                    <div className="flex items-center gap-3">
                      <Gift className="h-6 w-6" />
                      <span>GIRAR AGORA!</span>
                      <Sparkles className="h-5 w-5" />
                    </div>
                  ) : (
                    "AGUARDE O PRÓXIMO GIRO"
                  )}
                </Button>

                {diasConsecutivos >= 7 && (
                  <Button
                    variant="outline"
                    className="w-full h-12 border-2 border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl backdrop-blur-sm"
                    disabled
                  >
                    <Trophy className="h-5 w-5 mr-2" />
                    Bônus Semanal Desbloqueado!
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Modal de Probabilidades */}
          <AnimatePresence>
            {showChances && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 backdrop-blur-sm"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-center bg-gradient-to-r from-[#3B82F6] to-[#FF6B00] bg-clip-text text-transparent mb-6">
                    TABELA DE PROBABILIDADES
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {recompensas.map((recompensa, index) => (
                      <motion.div
                        key={recompensa.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <div className="text-3xl mb-2">{recompensa.icone}</div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 font-semibold mb-1">{recompensa.nome}</div>
                        <div className="text-lg text-[#3B82F6] font-bold">{recompensa.probabilidade}%</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Modal de Recompensa Ganha */}
      <Dialog open={showRewardModal} onOpenChange={fecharRewardModal}>
        <DialogContent className="max-w-lg bg-white dark:bg-gray-900 border-2 border-blue-300 dark:border-blue-600 shadow-2xl">
          <div className="text-center p-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10, stiffness: 100 }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-300/30 via-purple-300/40 to-orange-300/30 dark:from-blue-600/30 dark:via-purple-600/40 dark:to-orange-600/30 rounded-full blur-2xl scale-150"></div>
              <div className="relative text-8xl">
                {selectedReward?.icone}
              </div>
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#FF6B00] bg-clip-text text-transparent"
            >
              🎉 RECOMPENSA CONQUISTADA! 🎉
            </motion.h3>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl text-[#3B82F6] font-bold mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-600"
            >
              {selectedReward?.nome}
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-gray-600 dark:text-gray-300 mb-8 text-lg"
            >
              Sua recompensa foi adicionada à sua conta com sucesso!
            </motion.p>
            
            <Button
              onClick={fecharRewardModal}
              className="w-full h-14 bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#FF6B00] hover:from-[#2563EB] hover:via-[#4F46E5] hover:to-[#EA580C] text-white font-bold text-lg rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Gift className="h-6 w-6 mr-3" />
              COLETAR RECOMPENSA
              <Sparkles className="h-6 w-6 ml-3" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoletaRecompensasModal;

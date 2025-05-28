
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Gift, Star, Flame, Eye, Zap, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  { id: "1", nome: "10 SP", valor: 10, tipo: "pontos", probabilidade: 25, icone: "💰", cor: "#FFD700" },
  { id: "2", nome: "25 SP", valor: 25, tipo: "pontos", probabilidade: 20, icone: "💰", cor: "#FFD700" },
  { id: "3", nome: "50 SP", valor: 50, tipo: "pontos", probabilidade: 15, icone: "💰", cor: "#FFD700" },
  { id: "4", nome: "20 XP", valor: 20, tipo: "xp", probabilidade: 15, icone: "⭐", cor: "#FF6B00" },
  { id: "5", nome: "Moldura Rara", valor: 1, tipo: "moldura", probabilidade: 10, icone: "🖼️", cor: "#9C27B0" },
  { id: "6", nome: "Badge Especial", valor: 1, tipo: "badge", probabilidade: 8, icone: "🏆", cor: "#E91E63" },
  { id: "7", nome: "+10% XP (1h)", valor: 1, tipo: "boost", probabilidade: 5, icone: "⚡", cor: "#2196F3" },
  { id: "8", nome: "100 SP", valor: 100, tipo: "pontos", probabilidade: 2, icone: "💎", cor: "#4CAF50" },
];

const RoletaRecompensasModal: React.FC<RoletaRecompensasModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedReward, setSelectedReward] = useState<Recompensa | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [diasConsecutivos, setDiasConsecutivos] = useState(23);
  const [proximoGiroEm, setProximoGiroEm] = useState({ horas: 12, minutos: 34, segundos: 56 });
  const [giroDisponivel, setGiroDisponivel] = useState(true);
  const [showChances, setShowChances] = useState(false);

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

  const girarRoleta = () => {
    if (!giroDisponivel || isSpinning) return;

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
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedReward(selectedRecompensa);
      setShowRewardModal(true);
      setGiroDisponivel(false);
      setProximoGiroEm({ horas: 24, minutos: 0, segundos: 0 });
    }, 3000);
  };

  const fecharRewardModal = () => {
    setShowRewardModal(false);
    setSelectedReward(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-[#0A0A0F] via-[#1A1A2E] to-[#16213E] border-0 shadow-2xl">
          {/* Header Futurístico */}
          <DialogHeader className="relative border-b border-[#FF6B00]/20 bg-gradient-to-r from-[#FF6B00]/10 via-transparent to-[#FF6B00]/10 p-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF6B00]/5 to-transparent blur-xl"></div>
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-[#FF6B00] via-[#FFB366] to-[#FF6B00] bg-clip-text text-transparent relative z-10 flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-8 w-8 text-[#FF6B00]" />
                </motion.div>
                RECOMPENSA DIÁRIA PREMIUM
                <motion.div
                  animate={{ rotate: [360, 0] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                >
                  <Trophy className="h-8 w-8 text-[#FFD700]" />
                </motion.div>
              </DialogTitle>
            </motion.div>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-10 w-10 text-white/60 hover:text-white hover:bg-[#FF6B00]/20 rounded-full border border-[#FF6B00]/30"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </Button>
          </DialogHeader>

          <div className="flex flex-col lg:flex-row gap-8 p-8">
            {/* Área Central - Roleta e Controles */}
            <div className="flex-1 flex flex-col items-center space-y-8">
              {/* Sequência de Dias Consecutivos - Design Futurístico */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <div className="bg-gradient-to-r from-[#FF6B00]/20 via-[#FF6B00]/30 to-[#FF6B00]/20 rounded-2xl p-6 border border-[#FF6B00]/40 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-center gap-4">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        filter: ["hue-rotate(0deg)", "hue-rotate(30deg)", "hue-rotate(0deg)"]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Flame className="h-8 w-8 text-[#FF6B00]" />
                    </motion.div>
                    <div className="text-center">
                      <div className="text-4xl font-bold bg-gradient-to-r from-[#FF6B00] to-[#FFB366] bg-clip-text text-transparent">
                        {diasConsecutivos}
                      </div>
                      <div className="text-sm text-white/80 font-medium">DIAS CONSECUTIVOS</div>
                    </div>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Zap className="h-8 w-8 text-[#FFD700]" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Roleta Futurística */}
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B00]/30 via-[#FFB366]/40 to-[#FF6B00]/30 rounded-full blur-2xl scale-110"></div>
                
                <motion.div
                  className="relative w-96 h-96 rounded-full border-4 border-[#FF6B00] overflow-hidden shadow-2xl"
                  style={{
                    background: `conic-gradient(${recompensas.map((_, index) => 
                      `${index % 2 === 0 ? 'rgba(255, 107, 0, 0.2)' : 'rgba(22, 33, 62, 0.8)'} ${(index * 360 / recompensas.length)}deg ${((index + 1) * 360 / recompensas.length)}deg`
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
                        <div className="absolute top-20 text-xs text-white font-bold transform -rotate-90 whitespace-nowrap">
                          {recompensa.nome}
                        </div>
                      </div>
                    );
                  })}

                  {/* Centro da Roleta com Logo */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                      <Star className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </motion.div>

                {/* Ponteiro Futurístico */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[40px] border-l-transparent border-r-transparent border-b-[#FF6B00] shadow-lg"></div>
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#FF6B00] rounded-full border-2 border-white"></div>
                </div>
              </div>

              {/* Botão Ver Chances Redesignado */}
              <Button
                variant="ghost"
                size="sm"
                className="bg-gradient-to-r from-[#FF6B00]/20 to-[#FF8C40]/20 text-[#FF6B00] hover:from-[#FF6B00]/30 hover:to-[#FF8C40]/30 border border-[#FF6B00]/30 rounded-xl backdrop-blur-sm"
                onClick={() => setShowChances(!showChances)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showChances ? "Ocultar Probabilidades" : "Ver Probabilidades"}
              </Button>
            </div>

            {/* Painel Lateral Direito - Informações e Controles */}
            <div className="w-full lg:w-96 space-y-6">
              {/* Status do Próximo Giro */}
              {!giroDisponivel && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-br from-[#1A1A2E]/80 to-[#16213E]/80 rounded-2xl p-6 border border-[#FF6B00]/30 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Clock className="h-6 w-6 text-[#FF6B00]" />
                    <span className="text-white font-bold">PRÓXIMO GIRO EM:</span>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-mono font-bold bg-gradient-to-r from-[#FF6B00] to-[#FFB366] bg-clip-text text-transparent">
                      {String(proximoGiroEm.horas).padStart(2, '0')}:
                      {String(proximoGiroEm.minutos).padStart(2, '0')}:
                      {String(proximoGiroEm.segundos).padStart(2, '0')}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Preview de Recompensas em Destaque */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-[#1A1A2E]/80 to-[#16213E]/80 rounded-2xl p-6 border border-[#FF6B00]/30 backdrop-blur-xl"
              >
                <h3 className="text-lg font-bold text-white mb-4 text-center">RECOMPENSAS EM DESTAQUE</h3>
                <div className="grid grid-cols-2 gap-3">
                  {recompensas.slice(5, 8).map((recompensa, index) => (
                    <motion.div
                      key={recompensa.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-gradient-to-br from-[#FF6B00]/10 to-[#FF8C40]/10 rounded-xl p-4 text-center border border-[#FF6B00]/20"
                    >
                      <div className="text-2xl mb-2">{recompensa.icone}</div>
                      <div className="text-xs text-white font-semibold">{recompensa.nome}</div>
                      <div className="text-xs text-[#FF6B00] mt-1">{recompensa.probabilidade}%</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Botões de Ação */}
              <div className="space-y-4">
                <Button
                  onClick={girarRoleta}
                  disabled={!giroDisponivel || isSpinning}
                  className="w-full h-16 bg-gradient-to-r from-[#FF6B00] via-[#FF8C40] to-[#FF6B00] hover:from-[#FF8C40] hover:via-[#FF6B00] hover:to-[#FF8C40] text-white font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl shadow-2xl border-2 border-[#FFB366]/50 transition-all duration-300 transform hover:scale-105"
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

                <Button
                  variant="outline"
                  className="w-full h-12 border-2 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-xl backdrop-blur-sm"
                  disabled
                >
                  <Star className="h-5 w-5 mr-2" />
                  Girar 10x por 100 SP
                </Button>

                {diasConsecutivos >= 30 && (
                  <Button
                    variant="outline"
                    className="w-full h-12 border-2 border-purple-500 text-purple-400 hover:bg-purple-500/10 rounded-xl backdrop-blur-sm"
                  >
                    <Trophy className="h-5 w-5 mr-2" />
                    Giro VIP (+25% Sorte)
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
                className="border-t border-[#FF6B00]/30 bg-gradient-to-r from-[#1A1A2E]/50 to-[#16213E]/50 backdrop-blur-xl"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-6 text-center bg-gradient-to-r from-[#FF6B00] to-[#FFB366] bg-clip-text text-transparent">
                    TABELA DE PROBABILIDADES
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {recompensas.map((recompensa, index) => (
                      <motion.div
                        key={recompensa.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-[#FF6B00]/10 to-[#FF8C40]/10 rounded-xl p-4 text-center border border-[#FF6B00]/20 hover:border-[#FF6B00]/40 transition-all duration-300"
                      >
                        <div className="text-3xl mb-2">{recompensa.icone}</div>
                        <div className="text-sm text-white font-semibold mb-1">{recompensa.nome}</div>
                        <div className="text-lg text-[#FF6B00] font-bold">{recompensa.probabilidade}%</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Modal de Recompensa Ganha - Ultramoderno */}
      <Dialog open={showRewardModal} onOpenChange={fecharRewardModal}>
        <DialogContent className="max-w-lg bg-gradient-to-br from-[#0A0A0F] via-[#1A1A2E] to-[#16213E] border-2 border-[#FF6B00] shadow-2xl">
          <div className="text-center p-8">
            {/* Efeito de Explosão de Confete */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10, stiffness: 100 }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B00]/30 via-[#FFD700]/40 to-[#FF6B00]/30 rounded-full blur-2xl scale-150"></div>
              <div className="relative text-8xl">
                {selectedReward?.icone}
              </div>
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#FFD700] via-[#FF6B00] to-[#FFD700] bg-clip-text text-transparent"
            >
              🎉 RECOMPENSA CONQUISTADA! 🎉
            </motion.h3>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl text-[#FF6B00] font-bold mb-6 p-4 bg-gradient-to-r from-[#FF6B00]/10 to-[#FF8C40]/10 rounded-xl border border-[#FF6B00]/30"
            >
              {selectedReward?.nome}
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-white/80 mb-8 text-lg"
            >
              Sua recompensa foi adicionada à sua conta com sucesso!
            </motion.p>
            
            <Button
              onClick={fecharRewardModal}
              className="w-full h-14 bg-gradient-to-r from-[#FF6B00] via-[#FF8C40] to-[#FF6B00] hover:from-[#FF8C40] hover:via-[#FFD700] hover:to-[#FF8C40] text-white font-bold text-lg rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
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


import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Gift, Star, Flame, Eye } from "lucide-react";
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-[#001427] via-[#001427] to-[#29335C] border-[#FF6B00]/30">
          <DialogHeader className="relative">
            <DialogTitle className="text-2xl font-bold text-white text-center mb-4">
              🎁 Sua Recompensa Diária!
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>

          <div className="flex flex-col lg:flex-row gap-6 p-6">
            {/* Avatar do Usuário - Lado Esquerdo */}
            <div className="flex-shrink-0 flex justify-center lg:justify-start">
              <motion.div
                className="w-32 h-32 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center text-4xl"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                👋
              </motion.div>
            </div>

            {/* Área Central - Roleta e Informações */}
            <div className="flex-1 flex flex-col items-center">
              {/* Sequência de Dias Consecutivos */}
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-6 w-6 text-[#FF6B00]" />
                <span className="text-xl font-bold text-white">
                  {diasConsecutivos} dias consecutivos
                </span>
              </div>

              {/* Recompensas em Destaque */}
              <div className="flex gap-3 mb-4">
                {recompensas.slice(5, 8).map((recompensa) => (
                  <div key={recompensa.id} className="text-2xl opacity-60">
                    {recompensa.icone}
                  </div>
                ))}
              </div>

              {/* Roleta */}
              <div className="relative mb-6">
                <motion.div
                  className="w-80 h-80 rounded-full border-4 border-[#FF6B00] relative overflow-hidden shadow-2xl"
                  style={{
                    background: `conic-gradient(${recompensas.map((_, index) => 
                      `${index % 2 === 0 ? '#29335C' : '#001427'} ${(index * 360 / recompensas.length)}deg ${((index + 1) * 360 / recompensas.length)}deg`
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
                        <div className="absolute top-8 text-2xl">
                          {recompensa.icone}
                        </div>
                        <div className="absolute top-16 text-xs text-white font-semibold">
                          {recompensa.nome}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>

                {/* Ponteiro */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-[#FF6B00] rotate-45 border-2 border-white shadow-lg z-10"></div>
              </div>

              {/* Botão Ver Chances */}
              <Button
                variant="ghost"
                size="sm"
                className="text-[#FF6B00] hover:text-[#FF8C40] hover:bg-[#FF6B00]/10"
                onClick={() => setShowChances(!showChances)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Chances das Recompensas
              </Button>
            </div>

            {/* Lado Direito - Informações e Controles */}
            <div className="flex-shrink-0 w-full lg:w-80 space-y-4">
              {/* Cronômetro */}
              {!giroDisponivel && (
                <div className="bg-[#29335C]/50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-[#FF6B00]" />
                    <span className="text-white font-semibold">Próximo Giro em:</span>
                  </div>
                  <div className="text-2xl font-bold text-[#FF6B00]">
                    {String(proximoGiroEm.horas).padStart(2, '0')}:
                    {String(proximoGiroEm.minutos).padStart(2, '0')}:
                    {String(proximoGiroEm.segundos).padStart(2, '0')}
                  </div>
                </div>
              )}

              {/* Botões de Giro */}
              <div className="space-y-3">
                <Button
                  onClick={girarRoleta}
                  disabled={!giroDisponivel || isSpinning}
                  className="w-full h-12 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSpinning ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Gift className="h-5 w-5 mr-2" />
                    </motion.div>
                  ) : giroDisponivel ? (
                    <>
                      <Gift className="h-5 w-5 mr-2" />
                      Girar Agora!
                    </>
                  ) : (
                    "Aguarde o Próximo Giro"
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10"
                  disabled
                >
                  <Star className="h-4 w-4 mr-2" />
                  Girar 10x por 100 SP
                </Button>

                {diasConsecutivos >= 30 && (
                  <Button
                    variant="outline"
                    className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/10"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Giro Especial (+25% Sorte)
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Modal de Chances */}
          <AnimatePresence>
            {showChances && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-[#FF6B00]/30 p-4 bg-[#29335C]/30"
              >
                <h3 className="text-lg font-bold text-white mb-3">Chances das Recompensas:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {recompensas.map((recompensa) => (
                    <div key={recompensa.id} className="bg-[#001427]/50 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">{recompensa.icone}</div>
                      <div className="text-xs text-white font-semibold">{recompensa.nome}</div>
                      <div className="text-xs text-[#FF6B00]">{recompensa.probabilidade}%</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Modal de Recompensa Ganha */}
      <Dialog open={showRewardModal} onOpenChange={fecharRewardModal}>
        <DialogContent className="max-w-md bg-gradient-to-br from-[#001427] to-[#29335C] border-[#FF6B00]/30">
          <div className="text-center p-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="text-6xl mb-4"
            >
              {selectedReward?.icone}
            </motion.div>
            
            <h3 className="text-2xl font-bold text-white mb-2">
              🎉 Parabéns! Você Ganhou!
            </h3>
            
            <div className="text-xl text-[#FF6B00] font-bold mb-4">
              {selectedReward?.nome}
            </div>
            
            <p className="text-white/80 mb-6">
              Sua recompensa foi adicionada à sua conta!
            </p>
            
            <Button
              onClick={fecharRewardModal}
              className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-bold"
            >
              Coletar Recompensa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoletaRecompensasModal;


import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Gift, X, Star, Crown, Coins, BookOpen, Zap, Trophy, Award, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RoletaRecompensasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Recompensa {
  id: number;
  nome: string;
  icon: React.ReactNode;
  valor: string;
  cor: string;
  tipo: 'comum' | 'raro' | 'epico' | 'lendario';
}

const recompensas: Recompensa[] = [
  { id: 1, nome: "50 School Points", icon: <Coins className="h-6 w-6" />, valor: "50 SP", cor: "#FFD700", tipo: 'comum' },
  { id: 2, nome: "Boost XP 2x", icon: <Zap className="h-6 w-6" />, valor: "2x XP", cor: "#00FFFF", tipo: 'raro' },
  { id: 3, nome: "100 School Points", icon: <Coins className="h-6 w-6" />, valor: "100 SP", cor: "#FFD700", tipo: 'comum' },
  { id: 4, nome: "Acesso VIP", icon: <Crown className="h-6 w-6" />, valor: "VIP", cor: "#9D4EDD", tipo: 'epico' },
  { id: 5, nome: "150 School Points", icon: <Coins className="h-6 w-6" />, valor: "150 SP", cor: "#FFD700", tipo: 'comum' },
  { id: 6, nome: "Material Exclusivo", icon: <BookOpen className="h-6 w-6" />, valor: "Material", cor: "#00FFFF", tipo: 'raro' },
  { id: 7, nome: "200 School Points", icon: <Coins className="h-6 w-6" />, valor: "200 SP", cor: "#FFD700", tipo: 'comum' },
  { id: 8, nome: "Troféu Diamante", icon: <Trophy className="h-6 w-6" />, valor: "Troféu", cor: "#FF6B00", tipo: 'lendario' },
];

const RoletaRecompensasModal: React.FC<RoletaRecompensasModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedReward, setSelectedReward] = useState<Recompensa | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [canSpin, setCanSpin] = useState(true);

  const segmentAngle = 360 / recompensas.length;

  const handleSpin = () => {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);
    setSelectedReward(null);

    // Gerar rotação aleatória (mínimo 5 voltas completas + ângulo aleatório)
    const randomIndex = Math.floor(Math.random() * recompensas.length);
    const targetAngle = randomIndex * segmentAngle;
    const totalRotation = rotation + 1800 + (360 - targetAngle); // 5 voltas + posição final

    setRotation(totalRotation);

    // Simular duração da animação
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedReward(recompensas[randomIndex]);
      setShowRewardModal(true);
      setCanSpin(false);
    }, 4000);
  };

  const handleCollectReward = () => {
    setShowRewardModal(false);
    // Aqui você pode adicionar lógica para adicionar a recompensa ao inventário do usuário
    console.log(`Recompensa coletada: ${selectedReward?.nome}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[600px] p-0 bg-transparent border-0 shadow-none"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-orange-50/20 backdrop-blur-md border border-orange-200/30 rounded-2xl p-8 shadow-2xl"
          style={{
            background: "rgba(255, 245, 235, 0.15)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {/* Botão de fechar */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 border border-orange-200/30 transition-all duration-300"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4 text-orange-700" />
          </Button>

          {/* Título e ícone */}
          <div className="flex flex-col items-center text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", damping: 20, stiffness: 300 }}
              className="relative mb-4"
            >
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-4 rounded-full shadow-lg">
                <Gift className="h-8 w-8 text-white" />
              </div>
              
              {/* Efeito de brilho ao redor do ícone */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 to-orange-600/30 rounded-full blur-lg animate-pulse"></div>
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700 bg-clip-text text-transparent mb-2"
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                letterSpacing: "-0.025em",
              }}
            >
              Resgate sua recompensa
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-orange-700/80 text-sm font-medium"
            >
              Parabéns por manter sua sequência diária!
            </motion.p>
          </div>

          {/* Roleta */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              {/* Base da roleta com efeito flutuante */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-64 h-8 bg-black/10 rounded-full blur-xl"></div>
              
              {/* Container da roleta */}
              <div className="relative w-72 h-72">
                {/* Aro externo com LED pulsante */}
                <div className="absolute inset-0 rounded-full border-4 border-gray-600/50 shadow-2xl">
                  <div 
                    className={`absolute inset-0 rounded-full border-2 transition-all duration-1000 ${
                      canSpin ? 'border-orange-400 shadow-orange-400/50 animate-pulse' : 'border-gray-400/50'
                    }`}
                    style={{
                      boxShadow: canSpin ? '0 0 20px rgba(255, 107, 0, 0.6), inset 0 0 20px rgba(255, 107, 0, 0.1)' : 'none'
                    }}
                  ></div>
                </div>

                {/* Roleta principal */}
                <motion.div
                  className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                  }}
                  transition={{
                    duration: isSpinning ? 4 : 0,
                    ease: isSpinning ? [0.25, 0.1, 0.25, 1] : "linear",
                  }}
                >
                  {/* Padrão de fundo tecnológico */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20"></div>
                    {/* Linhas de circuito animadas */}
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-px h-full bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent"
                        style={{
                          left: `${50 + 40 * Math.cos((i * 30 * Math.PI) / 180)}%`,
                          top: `${50 + 40 * Math.sin((i * 30 * Math.PI) / 180)}%`,
                          transform: `rotate(${i * 30}deg)`,
                          transformOrigin: 'center'
                        }}
                        animate={{
                          opacity: [0.3, 0.7, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>

                  {/* Segmentos da roleta */}
                  {recompensas.map((recompensa, index) => {
                    const angle = index * segmentAngle;
                    const isSelected = selectedReward?.id === recompensa.id && !isSpinning;
                    
                    return (
                      <div
                        key={recompensa.id}
                        className="absolute inset-0"
                        style={{
                          transform: `rotate(${angle}deg)`,
                          transformOrigin: 'center',
                        }}
                      >
                        {/* Segmento */}
                        <div
                          className={`absolute top-0 left-1/2 w-0 h-0 transition-all duration-500 ${
                            isSelected ? 'filter brightness-150' : ''
                          }`}
                          style={{
                            borderLeft: '135px solid transparent',
                            borderRight: '135px solid transparent',
                            borderTop: `135px solid ${recompensa.cor}40`,
                            transform: 'translateX(-50%)',
                            borderTopColor: recompensa.tipo === 'lendario' ? '#FF6B0060' : 
                                           recompensa.tipo === 'epico' ? '#9D4EDD60' :
                                           recompensa.tipo === 'raro' ? '#00FFFF60' : '#FFD70060',
                          }}
                        />
                        
                        {/* Divisória luminosa */}
                        <div 
                          className="absolute top-0 left-1/2 w-px h-32 bg-gradient-to-b from-white/80 to-transparent transform -translate-x-1/2"
                          style={{
                            boxShadow: '0 0 4px rgba(255, 255, 255, 0.5)',
                          }}
                        />

                        {/* Ícone da recompensa */}
                        <div
                          className={`absolute top-12 left-1/2 transform -translate-x-1/2 text-white transition-all duration-500 ${
                            isSelected ? 'scale-125' : 'scale-100'
                          } ${isSpinning ? 'blur-sm' : 'blur-0'}`}
                          style={{
                            filter: isSelected ? `drop-shadow(0 0 10px ${recompensa.cor})` : 'none',
                          }}
                        >
                          {recompensa.icon}
                        </div>

                        {/* Texto da recompensa */}
                        <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 text-xs text-white font-bold text-center ${
                          isSpinning ? 'blur-sm' : 'blur-0'
                        }`}>
                          {recompensa.valor}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>

                {/* Centro da roleta com núcleo de energia */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-2xl border-2 border-white/20"
                    animate={{
                      boxShadow: canSpin ? [
                        '0 0 20px rgba(255, 107, 0, 0.8)',
                        '0 0 40px rgba(255, 107, 0, 0.6)',
                        '0 0 20px rgba(255, 107, 0, 0.8)',
                      ] : '0 0 10px rgba(255, 107, 0, 0.3)',
                    }}
                    transition={{
                      duration: 2,
                      repeat: canSpin ? Infinity : 0,
                    }}
                  >
                    {/* Partículas de energia no centro */}
                    {canSpin && [...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                          left: `${50 + 20 * Math.cos((i * 45 * Math.PI) / 180)}%`,
                          top: `${50 + 20 * Math.sin((i * 45 * Math.PI) / 180)}%`,
                        }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                    
                    <Award className="h-8 w-8 text-white" />
                  </motion.div>
                </div>

                {/* Ponteiro/Seletor - Feixe de luz */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                  <motion.div
                    className="w-1 h-8 bg-gradient-to-b from-white via-orange-400 to-transparent rounded-full"
                    style={{
                      boxShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 107, 0, 0.6)',
                    }}
                    animate={{
                      opacity: isSpinning ? [1, 0.5, 1] : 1,
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: isSpinning ? Infinity : 0,
                    }}
                  />
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-orange-400"></div>
                </div>
              </div>

              {/* Partículas flutuantes ao redor da roleta */}
              {canSpin && [...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-orange-400 rounded-full opacity-60"
                  style={{
                    left: `${50 + 180 * Math.cos((i * 30 * Math.PI) / 180)}px`,
                    top: `${50 + 180 * Math.sin((i * 30 * Math.PI) / 180)}px`,
                  }}
                  animate={{
                    y: [-10, 10, -10],
                    x: [-5, 5, -5],
                    opacity: [0.6, 1, 0.6],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.25,
                  }}
                />
              ))}
            </div>

            {/* Botão Girar */}
            <motion.div
              whileHover={{ scale: canSpin ? 1.05 : 1 }}
              whileTap={{ scale: canSpin ? 0.95 : 1 }}
            >
              <Button
                onClick={handleSpin}
                disabled={!canSpin || isSpinning}
                className={`px-8 py-4 text-lg font-bold rounded-xl transition-all duration-300 ${
                  canSpin && !isSpinning
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
                style={{
                  boxShadow: canSpin && !isSpinning ? '0 4px 20px rgba(255, 107, 0, 0.4)' : 'none',
                }}
              >
                {isSpinning ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="h-5 w-5 mr-2" />
                  </motion.div>
                ) : (
                  <>
                    <Target className="h-5 w-5 mr-2" />
                    {canSpin ? 'GIRAR AGORA!' : 'Aguarde o próximo giro'}
                  </>
                )}
              </Button>
            </motion.div>

            {!canSpin && !isSpinning && (
              <p className="text-orange-600 text-sm">
                Próximo giro disponível em 24 horas
              </p>
            )}
          </div>

          {/* Efeitos decorativos existentes */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-2xl">
            {/* Partículas flutuantes */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full opacity-60"
                initial={{ 
                  x: Math.random() * 400, 
                  y: Math.random() * 300,
                  scale: 0 
                }}
                animate={{ 
                  y: [null, -20, 20, -10, 5],
                  scale: [0, 1, 0.8, 1, 0.6],
                  opacity: [0, 0.8, 0.4, 0.8, 0]
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.3,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              />
            ))}
          </div>

          {/* Gradiente sutil no fundo */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(255, 107, 0, 0.1) 0%, transparent 70%)"
            }}
          />
        </motion.div>

        {/* Modal de Recompensa */}
        <AnimatePresence>
          {showRewardModal && selectedReward && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl border border-orange-200/30"
              >
                {/* Confetes digitais */}
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: ['#FFD700', '#FF6B00', '#00FFFF', '#9D4EDD'][Math.floor(Math.random() * 4)],
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      y: [0, -50, -100],
                    }}
                    transition={{
                      duration: 2,
                      delay: Math.random() * 0.5,
                    }}
                  />
                ))}

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", damping: 15, stiffness: 300 }}
                  className="text-6xl mb-4"
                  style={{ color: selectedReward.cor }}
                >
                  {selectedReward.icon}
                </motion.div>

                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-gray-800 dark:text-white mb-2"
                >
                  Parabéns! Você Ganhou!
                </motion.h3>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl font-semibold text-orange-600 mb-6"
                >
                  {selectedReward.nome}
                </motion.p>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    onClick={handleCollectReward}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Gift className="h-5 w-5 mr-2" />
                    Coletar Recompensa
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default RoletaRecompensasModal;

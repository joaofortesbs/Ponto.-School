
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Gift, X, Crown, Star, Trophy, Zap, BookOpen, Coins, Award, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RoletaRecompensasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Recompensa {
  id: number;
  nome: string;
  icon: React.ReactNode;
  color: string;
  value: string;
  type: 'comum' | 'raro' | 'epico' | 'lendario';
}

const recompensas: Recompensa[] = [
  { id: 1, nome: "50 School Points", icon: <Coins className="h-6 w-6" />, color: "#FFD700", value: "50 SP", type: 'comum' },
  { id: 2, nome: "Boost de XP", icon: <Zap className="h-6 w-6" />, color: "#00BFFF", value: "2x XP", type: 'raro' },
  { id: 3, nome: "Acesso Premium", icon: <Crown className="h-6 w-6" />, color: "#9932CC", value: "3 dias", type: 'epico' },
  { id: 4, nome: "E-book Grátis", icon: <BookOpen className="h-6 w-6" />, color: "#32CD32", value: "1 livro", type: 'comum' },
  { id: 5, nome: "Certificado", icon: <Award className="h-6 w-6" />, color: "#FF6347", value: "Digital", type: 'raro' },
  { id: 6, nome: "Conquista Rara", icon: <Trophy className="h-6 w-6" />, color: "#FF1493", value: "Badge", type: 'lendario' },
  { id: 7, nome: "100 School Points", icon: <Star className="h-6 w-6" />, color: "#FFD700", value: "100 SP", type: 'raro' },
  { id: 8, nome: "Vida Extra", icon: <Heart className="h-6 w-6" />, color: "#FF69B4", value: "+1", type: 'comum' },
];

const RoletaRecompensasModal: React.FC<RoletaRecompensasModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedReward, setSelectedReward] = useState<Recompensa | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [wheelAvailable, setWheelAvailable] = useState(true);
  const [nextSpinTime, setNextSpinTime] = useState<Date | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  const segmentAngle = 360 / recompensas.length;

  const spinWheel = () => {
    if (!wheelAvailable || isSpinning) return;

    setIsSpinning(true);
    setWheelAvailable(false);

    // Calcular rotação aleatória (mínimo 5 voltas completas + posição aleatória)
    const randomReward = Math.floor(Math.random() * recompensas.length);
    const baseRotation = 360 * 5; // 5 voltas completas
    const targetAngle = randomReward * segmentAngle;
    const finalRotation = rotation + baseRotation + (360 - targetAngle);

    setRotation(finalRotation);

    // Simular som de power up
    setTimeout(() => {
      // Parar a roleta após 3 segundos
      setTimeout(() => {
        setIsSpinning(false);
        setSelectedReward(recompensas[randomReward]);
        setShowReward(true);
        
        // Definir próximo giro para 24h
        const nextSpin = new Date();
        nextSpin.setHours(nextSpin.getHours() + 24);
        setNextSpinTime(nextSpin);
      }, 3000);
    }, 100);
  };

  const collectReward = () => {
    setShowReward(false);
    setSelectedReward(null);
    // Aqui você adicionaria a lógica para adicionar a recompensa ao perfil do usuário
  };

  const getSegmentStyle = (index: number) => {
    const isHovered = hoveredSegment === index;
    const isSelected = selectedReward?.id === recompensas[index].id && !isSpinning;
    
    return {
      transform: `rotate(${index * segmentAngle}deg)`,
      transformOrigin: '50% 50%',
      filter: isSelected ? 'brightness(1.5) drop-shadow(0 0 20px currentColor)' : 
              isHovered ? 'brightness(1.2)' : 'brightness(1)',
      transition: 'filter 0.3s ease',
    };
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
          className="relative bg-gray-900/90 backdrop-blur-md border-2 rounded-3xl p-8 shadow-2xl overflow-hidden"
          style={{
            background: "radial-gradient(circle at center, rgba(20, 20, 20, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderColor: "#921c11",
          }}
        >
          {/* Efeitos de fundo tecnológico */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            {/* Partículas de energia */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-orange-400 rounded-full opacity-60"
                initial={{ 
                  x: Math.random() * 600, 
                  y: Math.random() * 400,
                  scale: 0 
                }}
                animate={{ 
                  y: [null, -30, 30, -20, 10],
                  scale: [0, 1, 0.6, 1, 0.4],
                  opacity: [0, 0.8, 0.3, 0.6, 0]
                }}
                transition={{
                  duration: 4,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              />
            ))}
            
            {/* Linhas de circuito */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" className="text-orange-400">
                <defs>
                  <pattern id="circuit" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M0 20h40M20 0v40" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#circuit)" />
              </svg>
            </div>
          </div>

          {/* Botão de fechar */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 border transition-all duration-300 z-20"
            style={{ borderColor: "#921c11" }}
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4 text-white" />
          </Button>

          {/* Título */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-300 to-orange-500 bg-clip-text text-transparent mb-2">
              Roleta de Recompensas Diárias
            </h2>
            <p className="text-orange-200/90 text-sm font-medium">
              Gire a roleta e ganhe recompensas incríveis!
            </p>
          </motion.div>

          {/* Container da Roleta */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Base da roleta */}
              <div className="relative w-80 h-80">
                {/* Aro externo com LED pulsante */}
                <motion.div
                  className="absolute inset-0 rounded-full border-4 shadow-2xl"
                  style={{
                    borderColor: "#921c11",
                    background: "conic-gradient(from 0deg, rgba(146, 28, 17, 0.1), rgba(255, 107, 0, 0.1), rgba(146, 28, 17, 0.1))",
                  }}
                  animate={wheelAvailable ? {
                    boxShadow: [
                      "0 0 20px rgba(146, 28, 17, 0.5)",
                      "0 0 40px rgba(255, 107, 0, 0.8)",
                      "0 0 20px rgba(146, 28, 17, 0.5)"
                    ]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Roleta principal */}
                <motion.div
                  className="absolute inset-4 rounded-full overflow-hidden"
                  style={{
                    background: "radial-gradient(circle at center, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 1) 100%)",
                    transform: `rotate(${rotation}deg)`,
                  }}
                  animate={isSpinning ? { rotate: rotation } : {}}
                  transition={isSpinning ? { duration: 3, ease: "easeOut" } : {}}
                >
                  {/* Segmentos da roleta */}
                  {recompensas.map((recompensa, index) => (
                    <div
                      key={recompensa.id}
                      className="absolute inset-0 cursor-pointer"
                      style={getSegmentStyle(index)}
                      onMouseEnter={() => !isSpinning && setHoveredSegment(index)}
                      onMouseLeave={() => setHoveredSegment(null)}
                    >
                      <div
                        className="absolute w-full h-full"
                        style={{
                          clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((segmentAngle * Math.PI) / 180)}% ${50 - 50 * Math.sin((segmentAngle * Math.PI) / 180)}%)`,
                          background: `linear-gradient(${index * segmentAngle}deg, ${recompensa.color}20, ${recompensa.color}10)`,
                          borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                      />
                      
                      {/* Ícone da recompensa */}
                      <div
                        className="absolute flex items-center justify-center"
                        style={{
                          top: "25%",
                          left: "50%",
                          transform: `translate(-50%, -50%) rotate(${(segmentAngle / 2)}deg)`,
                          color: recompensa.color,
                        }}
                      >
                        <motion.div
                          animate={hoveredSegment === index ? { scale: 1.2, rotate: 360 } : { scale: 1, rotate: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {recompensa.icon}
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </motion.div>

                {/* Centro da roleta */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg border-2"
                    style={{ borderColor: "#921c11" }}
                    animate={wheelAvailable ? {
                      boxShadow: [
                        "0 0 20px rgba(255, 107, 0, 0.6)",
                        "0 0 30px rgba(255, 107, 0, 1)",
                        "0 0 20px rgba(255, 107, 0, 0.6)"
                      ]
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Gift className="h-8 w-8 text-white" />
                  </motion.div>
                </div>

                {/* Ponteiro/Seletor */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                  <motion.div
                    className="w-4 h-8 bg-gradient-to-b from-white to-orange-300 clip-triangle"
                    style={{
                      clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                    }}
                    animate={selectedReward && !isSpinning ? {
                      scale: [1, 1.2, 1],
                      filter: [
                        "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                        "drop-shadow(0 0 20px rgba(255,255,255,0.8))",
                        "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                      ]
                    } : {}}
                    transition={{ duration: 0.5, repeat: selectedReward ? 2 : 0 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botão de girar */}
          <div className="text-center">
            {wheelAvailable ? (
              <motion.button
                className={`px-8 py-4 rounded-xl font-bold text-white text-lg transition-all duration-300 ${
                  isSpinning 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transform hover:scale-105'
                }`}
                onClick={spinWheel}
                disabled={isSpinning}
                animate={!isSpinning ? {
                  boxShadow: [
                    "0 4px 20px rgba(255, 107, 0, 0.4)",
                    "0 4px 30px rgba(255, 107, 0, 0.6)",
                    "0 4px 20px rgba(255, 107, 0, 0.4)"
                  ]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSpinning ? 'Girando...' : 'GIRAR AGORA!'}
              </motion.button>
            ) : (
              <div className="text-center">
                <p className="text-orange-200 mb-2">Próximo giro disponível em:</p>
                <div className="text-2xl font-bold text-orange-400">
                  {nextSpinTime ? `${Math.ceil((nextSpinTime.getTime() - Date.now()) / (1000 * 60 * 60))}h` : '24h'}
                </div>
              </div>
            )}
          </div>

          {/* Tooltip para segmentos */}
          <AnimatePresence>
            {hoveredSegment !== null && !isSpinning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-2 rounded-lg text-sm"
              >
                {recompensas[hoveredSegment].nome}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Modal de recompensa */}
        <AnimatePresence>
          {showReward && selectedReward && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gradient-to-br from-gray-900 to-black border-2 rounded-2xl p-8 text-center max-w-md mx-4"
                style={{ borderColor: selectedReward.color }}
              >
                {/* Confetes digitais */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{ backgroundColor: selectedReward.color }}
                    initial={{ 
                      x: 0, 
                      y: 0, 
                      scale: 0 
                    }}
                    animate={{ 
                      x: (Math.random() - 0.5) * 200,
                      y: (Math.random() - 0.5) * 200,
                      scale: [0, 1, 0],
                      rotate: 360
                    }}
                    transition={{ 
                      duration: 1.5,
                      delay: i * 0.1
                    }}
                  />
                ))}

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", damping: 20 }}
                  className="mb-6"
                  style={{ color: selectedReward.color }}
                >
                  <div className="text-6xl mb-4">
                    {selectedReward.icon}
                  </div>
                </motion.div>

                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Parabéns! Você Ganhou!
                </motion.h3>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-lg text-orange-300 mb-2"
                >
                  {selectedReward.nome}
                </motion.p>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-xl font-bold mb-6"
                  style={{ color: selectedReward.color }}
                >
                  {selectedReward.value}
                </motion.p>

                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300"
                  onClick={collectReward}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Coletar Recompensa
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default RoletaRecompensasModal;


import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Gift, X, Play } from "lucide-react";
import { motion, useAnimation } from "framer-motion";

interface RoletaRecompensasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Dados das recompensas da roleta
const recompensasRoleta = [
  { id: 1, nome: "50 SP", cor: "#FF6B00", icone: "💰" },
  { id: 2, nome: "100 SP", cor: "#FFD700", icone: "🪙" },
  { id: 3, nome: "Badge", cor: "#9333EA", icone: "🏆" },
  { id: 4, nome: "25 SP", cor: "#3B82F6", icone: "💎" },
  { id: 5, nome: "Certificado", cor: "#10B981", icone: "📜" },
  { id: 6, nome: "200 SP", cor: "#EF4444", icone: "💸" },
  { id: 7, nome: "E-book", cor: "#8B5CF6", icone: "📚" },
  { id: 8, nome: "75 SP", cor: "#F59E0B", icone: "✨" },
];

const RoletaRecompensasModal: React.FC<RoletaRecompensasModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const roletaControls = useAnimation();
  const roletaRef = useRef<HTMLDivElement>(null);

  const girarRoleta = async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResultado(null);

    // Calcular rotação aleatória (múltiplos de 360 + ângulo final)
    const recompensaEscolhida = Math.floor(Math.random() * recompensasRoleta.length);
    const anguloRecompensa = (360 / recompensasRoleta.length) * recompensaEscolhida;
    const voltasCompletas = Math.floor(Math.random() * 5) + 8; // 8-12 voltas
    const rotacaoTotal = voltasCompletas * 360 + (360 - anguloRecompensa);

    // Animação com desaceleração suave
    await roletaControls.start({
      rotate: rotacaoTotal,
      transition: {
        duration: 4,
        ease: [0.25, 0.1, 0.25, 1], // Cubic bezier para desaceleração suave
      },
    });

    // Mostrar resultado após a animação
    setTimeout(() => {
      setResultado(recompensasRoleta[recompensaEscolhida].nome);
      setIsSpinning(false);
    }, 500);
  };

  const resetarRoleta = () => {
    roletaControls.set({ rotate: 0 });
    setResultado(null);
    setIsSpinning(false);
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
          className="relative bg-gradient-to-br from-orange-50/30 via-orange-100/20 to-orange-200/30 backdrop-blur-xl border border-orange-200/40 rounded-3xl p-8 shadow-2xl"
          style={{
            background: "rgba(255, 245, 235, 0.25)",
            backdropFilter: "blur(25px)",
            WebkitBackdropFilter: "blur(25px)",
          }}
        >
          {/* Botão de fechar */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 border border-orange-200/30 transition-all duration-300"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4 text-orange-700" />
          </Button>

          {/* Título */}
          <div className="text-center mb-8">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700 bg-clip-text text-transparent mb-2"
            >
              Roleta de Recompensas
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-orange-700/80 text-sm font-medium"
            >
              Gire a roleta e ganhe sua recompensa diária!
            </motion.p>
          </div>

          {/* Container da Roleta */}
          <div className="flex flex-col items-center space-y-6">
            {/* Roleta */}
            <div className="relative">
              {/* Pino/Seta da roleta */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[24px] border-l-transparent border-r-transparent border-b-orange-600 drop-shadow-lg"></div>
                <div className="absolute top-[20px] left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-600 rounded-full border-2 border-white shadow-lg"></div>
              </div>

              {/* Roleta */}
              <motion.div
                ref={roletaRef}
                animate={roletaControls}
                className="relative w-80 h-80 rounded-full border-8 border-white shadow-2xl overflow-hidden"
                style={{
                  background: "conic-gradient(from 0deg, #FF6B00, #FFD700, #9333EA, #3B82F6, #10B981, #EF4444, #8B5CF6, #F59E0B)",
                }}
              >
                {/* Segmentos da roleta */}
                {recompensasRoleta.map((recompensa, index) => {
                  const angulo = (360 / recompensasRoleta.length) * index;
                  const anguloSegmento = 360 / recompensasRoleta.length;
                  
                  return (
                    <div
                      key={recompensa.id}
                      className="absolute w-full h-full flex items-center justify-center"
                      style={{
                        transform: `rotate(${angulo}deg)`,
                        clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((anguloSegmento * Math.PI) / 180)}% ${50 - 50 * Math.cos((anguloSegmento * Math.PI) / 180)}%)`,
                        backgroundColor: recompensa.cor,
                      }}
                    >
                      <div 
                        className="text-center text-white font-bold transform"
                        style={{
                          transform: `rotate(${-(angulo + anguloSegmento/2)}deg) translateY(-60px)`,
                        }}
                      >
                        <div className="text-2xl mb-1">{recompensa.icone}</div>
                        <div className="text-xs font-semibold drop-shadow-md">
                          {recompensa.nome}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Centro da roleta */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10">
                  <Gift className="h-6 w-6 text-white" />
                </div>
              </motion.div>
            </div>

            {/* Botão de girar */}
            <div className="text-center space-y-4">
              <Button
                onClick={girarRoleta}
                disabled={isSpinning}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSpinning ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Play className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <Play className="h-5 w-5 mr-2" />
                )}
                {isSpinning ? "Girando..." : "Girar Roleta"}
              </Button>

              {/* Resultado */}
              {resultado && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className="bg-gradient-to-r from-green-400 to-green-600 text-white p-4 rounded-xl shadow-lg"
                >
                  <div className="text-center">
                    <div className="text-xl font-bold mb-1">🎉 Parabéns!</div>
                    <div className="text-lg">Você ganhou: <span className="font-bold">{resultado}</span></div>
                  </div>
                </motion.div>
              )}

              {/* Botão reset (só aparece após resultado) */}
              {resultado && (
                <Button
                  onClick={resetarRoleta}
                  variant="outline"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  Tentar Novamente
                </Button>
              )}
            </div>
          </div>

          {/* Efeitos decorativos */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-3xl">
            {/* Partículas flutuantes */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full opacity-60"
                initial={{ 
                  x: Math.random() * 500, 
                  y: Math.random() * 400,
                  scale: 0 
                }}
                animate={{ 
                  y: [null, -30, 30, -15, 10],
                  scale: [0, 1, 0.8, 1, 0.6],
                  opacity: [0, 0.8, 0.4, 0.8, 0]
                }}
                transition={{
                  duration: 4,
                  delay: i * 0.3,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              />
            ))}
          </div>

          {/* Gradiente de fundo */}
          <div 
            className="absolute inset-0 rounded-3xl opacity-20 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(255, 107, 0, 0.15) 0%, transparent 70%)"
            }}
          />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default RoletaRecompensasModal;

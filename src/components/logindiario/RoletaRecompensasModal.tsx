import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Gift, X } from "lucide-react";
import { motion } from "framer-motion";

interface RoletaRecompensasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RoletaRecompensasModal: React.FC<RoletaRecompensasModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px] p-0 bg-transparent border-0 shadow-none"
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
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", damping: 20, stiffness: 300 }}
                className="relative flex-shrink-0"
              >
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-full shadow-lg">
                  <Gift className="h-6 w-6 text-white" />
                </div>

                {/* Efeito de brilho ao redor do ícone */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 to-orange-600/30 rounded-full blur-lg animate-pulse"></div>
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700 bg-clip-text text-transparent"
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  letterSpacing: "-0.025em",
                }}
              >
                Resgate sua recompensa
              </motion.h2>
            </div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-orange-700/80 text-sm font-medium text-center"
            >
              Parabéns por manter sua sequência diária!
            </motion.p>

            {/* Roleta de Recompensas */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8, type: "spring", damping: 15 }}
              className="mt-8 flex justify-center"
            >
              <div className="relative">
                {/* Container da Roleta */}
                <div className="relative w-64 h-64">
                  {/* Círculo da Roleta */}
                  <div className="w-full h-full rounded-full border-4 border-orange-300 bg-gradient-to-br from-orange-100 to-orange-200 relative overflow-hidden shadow-xl">
                    {/* Seções da Roleta */}
                    <div className="absolute inset-0 rounded-full" style={{
                      background: `conic-gradient(
                        from 0deg,
                        #FF6B00 0deg 60deg,
                        #FF8C40 60deg 120deg,
                        #FFB366 120deg 180deg,
                        #FF9933 180deg 240deg,
                        #FFA366 240deg 300deg,
                        #FF7A1A 300deg 360deg
                      )`
                    }}>
                      {/* Linhas Divisórias Fixas */}
                      <div className="absolute inset-0">
                        {Array.from({ length: 6 }, (_, index) => {
                          const angle = index * 60; // 0°, 60°, 120°, 180°, 240°, 300°
                          return (
                            <div
                              key={`linha-divisoria-${index}`}
                              className="absolute w-0.5 bg-white/30 shadow-sm"
                              style={{
                                height: '50%',
                                left: '50%',
                                top: '50%',
                                transformOrigin: 'center bottom',
                                transform: `translate(-50%, -100%) rotate(${angle}deg)`,
                                zIndex: 10
                              }}
                            />
                          );
                        })}
                      </div>

                      {/* Bolinhas Marcadoras - Posicionadas Exatamente Sobre as Linhas */}
                      <div className="absolute inset-0">
                        {Array.from({ length: 6 }, (_, index) => {
                          const angle = index * 60; // Mesmo ângulo das linhas: 0°, 60°, 120°, 180°, 240°, 300°
                          const radians = (angle * Math.PI) / 180;
                          const radius = 47; // Raio em porcentagem para posicionar na borda da roleta
                          
                          // Calcular posição usando seno e cosseno
                          const x = 50 + radius * Math.cos(radians); // Centro em 50% + deslocamento
                          const y = 50 + radius * Math.sin(radians); // Centro em 50% + deslocamento

                          return (
                            <div 
                              key={`bolinha-linha-${index}`}
                              className="absolute w-4 h-4 bg-white rounded-full shadow-xl border-2 border-orange-400"
                              style={{
                                left: `${x}%`,
                                top: `${y}%`,
                                transform: 'translate(-50%, -50%)',
                                zIndex: 20 // Z-index maior que as linhas para ficar por cima
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Centro da Roleta */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-orange-400 flex items-center justify-center shadow-lg z-10">
                    <Gift className="h-8 w-8 text-orange-600" />
                  </div>

                  {/* Ponteiro da Roleta - Lateral Direita Apontando para Dentro */}
                  <div className="absolute top-1/2 right-0 transform translate-x-2 -translate-y-1/2 z-20">
                    <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent border-l-orange-600 shadow-lg transform rotate-180"></div>
                  </div>
                </div>

                {/* Botão Girar */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-6 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin opacity-0 group-hover:opacity-100"></div>
                  Girar Roleta
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Efeitos decorativos */}
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
      </DialogContent>
    </Dialog>
  );
};

export default RoletaRecompensasModal;
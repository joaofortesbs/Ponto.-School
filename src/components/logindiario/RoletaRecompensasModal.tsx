
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
  // Configuração otimizada do pino da roleta para eventos futuros
  const pinoConfig = {
    // Propriedades de posicionamento
    position: {
      x: 128 + (128 * 1.1), // 1.1 * raio da roleta
      y: 128, // Centro vertical
      angle: -15, // Ângulo de inclinação para dentro
    },
    
    // Propriedades visuais
    design: {
      grafiteColor: '#333333',
      madeiraColor: '#FF6B00',
      borrachaColor: '#FFC1CC',
      seloColor: '#FF6B00'
    },
    
    // Estado do pino
    state: {
      active: true,
      interactionEnabled: false // Para expansão futura
    },
    
    // Métodos para eventos futuros (placeholders otimizados)
    events: {
      onClick: () => {
        // Placeholder para clique no pino
        console.log('Pino clicado - evento futuro');
      },
      
      onHover: () => {
        // Placeholder para hover no pino
        console.log('Pino hover - evento futuro');
      },
      
      onInteraction: () => {
        // Placeholder para interações gerais
        console.log('Pino interação - evento futuro');
      },
      
      onCollisionDetection: (target: any) => {
        // Placeholder para detecção de colisão
        console.log('Pino colisão detectada:', target);
      }
    }
  };

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
                        #FF6B00 0deg 36deg,
                        #FF8C40 36deg 72deg,
                        #FFB366 72deg 108deg,
                        #FF9933 108deg 144deg,
                        #FFA366 144deg 180deg,
                        #FF7A1A 180deg 216deg,
                        #FF6B00 216deg 252deg,
                        #FF8C40 252deg 288deg,
                        #FFB366 288deg 324deg,
                        #FF9933 324deg 360deg
                      )`
                    }}>
                      {/* Linhas divisórias entre as seções */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Gerando as 10 linhas divisórias com ângulos de 36 graus */}
                        {[...Array(10)].map((_, index) => {
                          const angle = index * 36; // 0°, 36°, 72°, 108°, 144°, 180°, 216°, 252°, 288°, 324°
                          return (
                            <div 
                              key={`linha-${index}`}
                              className="absolute w-0.5 h-32 bg-white/50 origin-bottom"
                              style={{
                                transform: `rotate(${angle}deg)`,
                                transformOrigin: '50% 100%',
                                bottom: '50%',
                                left: '50%',
                                marginLeft: '-1px'
                              }}
                            ></div>
                          );
                        })}
                      </div>

                      {/* Bolinhas nas linhas divisórias */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {[...Array(10)].map((_, index) => {
                          const angle = index * 36; // Ângulos: 0°, 36°, 72°, etc.
                          const radius = 121; // Ajustado para 95% do raio original (128 * 0.95) para evitar cortes
                          const ballRadius = 6; // Raio das bolinhas (5% do diâmetro da roleta)
                          
                          // Convertendo ângulo para radianos e calculando posição
                          const angleRad = (angle - 90) * (Math.PI / 180); // -90 para começar no topo
                          const x = radius * Math.cos(angleRad);
                          const y = radius * Math.sin(angleRad);
                          
                          return (
                            <div
                              key={`bolinha-${index}`}
                              className="absolute w-3 h-3 bg-white rounded-full shadow-lg"
                              style={{
                                left: '50%',
                                top: '50%',
                                transform: `translate(${x - ballRadius}px, ${y - ballRadius}px)`,
                                zIndex: 10,
                                border: '2px solid #FFA500'
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

                  {/* Pino da Roleta - Design Educacional de Lápis */}
                  <div 
                    className="absolute z-20"
                    style={{
                      right: '-24px', // Posiciona 1.1 * raio da roleta (128px * 1.1 = ~140px, ajustado para -24px)
                      top: '50%',
                      transform: 'translateY(-50%) rotate(-15deg)', // Inclinado para dentro
                      transformOrigin: 'center'
                    }}
                  >
                    {/* Container do Pino Educacional */}
                    <div className="relative flex items-center">
                      {/* Ponta do Grafite (cinza escura) */}
                      <div 
                        className="absolute left-0 z-30"
                        style={{
                          width: '0',
                          height: '0',
                          borderTop: '6px solid transparent',
                          borderBottom: '6px solid transparent',
                          borderRight: '12px solid #333333',
                          filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'
                        }}
                      ></div>

                      {/* Corpo do Lápis (laranja educacional) */}
                      <div 
                        className="relative ml-3"
                        style={{
                          width: '32px',
                          height: '16px',
                          backgroundColor: '#FF6B00',
                          borderRadius: '0 8px 8px 0',
                          background: 'linear-gradient(135deg, #FF6B00 0%, #FF8F40 50%, #FF6B00 100%)',
                          boxShadow: '2px 2px 4px rgba(0,0,0,0.2), inset 1px 1px 2px rgba(255,255,255,0.3)'
                        }}
                      >
                        {/* Detalhes de Textura do Lápis */}
                        <div 
                          className="absolute top-1 left-2 w-6 h-0.5 rounded"
                          style={{ backgroundColor: '#E55A00', opacity: 0.6 }}
                        ></div>
                        <div 
                          className="absolute bottom-1 left-2 w-4 h-0.5 rounded"
                          style={{ backgroundColor: '#E55A00', opacity: 0.4 }}
                        ></div>
                        
                        {/* Borracha Rosa (detalhe superior) */}
                        <div 
                          className="absolute -right-1 top-1/2 transform -translate-y-1/2"
                          style={{
                            width: '8px',
                            height: '10px',
                            backgroundColor: '#FFC1CC',
                            borderRadius: '0 4px 4px 0',
                            background: 'linear-gradient(135deg, #FFC1CC 0%, #FFB3C1 50%, #FFC1CC 100%)',
                            boxShadow: '1px 1px 2px rgba(0,0,0,0.15)'
                          }}
                        ></div>
                      </div>

                      {/* Marca Educacional (pequeno selo de qualidade) */}
                      <div 
                        className="absolute top-0 left-4 w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: '#FF6B00',
                          opacity: 0.8,
                          boxShadow: '0 0 3px rgba(255, 107, 0, 0.5)'
                        }}
                      ></div>
                    </div>
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

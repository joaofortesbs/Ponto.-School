
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Gift, X, Calendar, Target, Bell } from "lucide-react";
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-lg z-[9999] flex items-center justify-center p-4"
          style={{ pointerEvents: 'auto' }}
        >
          <motion.div
            className="rounded-xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden glassmorphism-modal"
            style={{
              background: "linear-gradient(135deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.15) 50%, rgba(255, 255, 255, 0.03) 100%)",
              backdropFilter: "blur(40px) saturate(200%) brightness(0.7)",
              WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(0.7)",
              border: "1px solid rgba(255, 107, 0, 0.3)",
              boxShadow: `
                0 12px 48px rgba(0, 0, 0, 0.5),
                0 4px 16px rgba(255, 107, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                inset 0 -1px 0 rgba(0, 0, 0, 0.2)
              `,
            }}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.4 
            }}
          >
            {/* Efeitos visuais de fundo idênticos ao modal Bem-vindo de volta */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FF6B00]/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#FF8C40]/8 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#FF6B00]/5 rounded-full blur-2xl"></div>

            {/* Botão de fechar idêntico */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-300 text-white/70 hover:text-white"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Conteúdo do modal */}
            <div className="relative z-10 text-center">
              {/* Ícone principal com mesmo estilo */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", damping: 20, stiffness: 300 }}
                className="relative mb-6 flex justify-center"
              >
                <div className="relative">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center relative"
                    style={{
                      background: "linear-gradient(135deg, #FF6B00 0%, #FF8C40 100%)",
                      boxShadow: `
                        0 0 20px rgba(255, 107, 0, 0.4),
                        0 0 40px rgba(255, 107, 0, 0.2),
                        inset 0 2px 4px rgba(255, 255, 255, 0.2),
                        inset 0 -2px 4px rgba(0, 0, 0, 0.2)
                      `,
                    }}
                  >
                    <Gift className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Efeito de brilho ao redor do ícone */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF6B00]/30 to-[#FF8C40]/30 blur-lg animate-pulse"></div>
                </div>
              </motion.div>

              {/* Título principal com mesmo estilo */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-2xl font-bold text-white mb-2"
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  letterSpacing: "-0.025em",
                  textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)"
                }}
              >
                Resgate sua recompensa! ✨
              </motion.h2>

              {/* Subtítulo */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-white/80 text-sm font-medium mb-8"
                style={{ textShadow: "0 1px 4px rgba(0, 0, 0, 0.3)" }}
              >
                Parabéns por manter sua sequência diária!
              </motion.p>

              {/* Lista de ações com mesmo estilo do modal Bem-vindo */}
              <div className="space-y-3 mb-8">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/10 backdrop-blur-sm hover:bg-black/30 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/20 flex items-center justify-center border border-[#FF6B00]/30">
                    <Calendar className="h-5 w-5 text-[#FF6B00]" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-medium text-sm">Ver sequência de estudos</div>
                    <div className="text-white/60 text-xs">Acompanhe seus dias consecutivos</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/10 backdrop-blur-sm hover:bg-black/30 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#FF8C40]/20 flex items-center justify-center border border-[#FF8C40]/30">
                    <Bell className="h-5 w-5 text-[#FF8C40]" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-medium text-sm">Receber lembretes</div>
                    <div className="text-white/60 text-xs">Configure notificações diárias</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/10 backdrop-blur-sm hover:bg-black/30 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#FFD700]/20 flex items-center justify-center border border-[#FFD700]/30">
                    <Target className="h-5 w-5 text-[#FFD700]" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-medium text-sm">Definir metas diárias</div>
                    <div className="text-white/60 text-xs">Estabeleça objetivos de estudo</div>
                  </div>
                </motion.div>
              </div>

              {/* Botão principal com mesmo estilo */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="w-full"
              >
                <Button
                  onClick={() => onOpenChange(false)}
                  className="w-full h-12 text-white font-semibold text-base rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #FF6B00 0%, #FF8C40 100%)",
                    boxShadow: `
                      0 4px 16px rgba(255, 107, 0, 0.4),
                      0 2px 8px rgba(255, 107, 0, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2)
                    `,
                    border: "1px solid rgba(255, 107, 0, 0.3)"
                  }}
                >
                  Continuar 🚀
                </Button>
              </motion.div>
            </div>

            {/* Efeitos decorativos com partículas */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-xl">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-full opacity-60"
                  initial={{ 
                    x: Math.random() * 400, 
                    y: Math.random() * 300,
                    scale: 0 
                  }}
                  animate={{ 
                    y: [null, -15, 15, -8, 3],
                    scale: [0, 1, 0.6, 1, 0.4],
                    opacity: [0, 0.8, 0.3, 0.8, 0]
                  }}
                  transition={{
                    duration: 4,
                    delay: i * 0.4,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                />
              ))}
            </div>

            {/* Gradiente sutil no fundo */}
            <div 
              className="absolute inset-0 rounded-xl opacity-20 pointer-events-none"
              style={{
                background: "radial-gradient(circle at 50% 30%, rgba(255, 107, 0, 0.08) 0%, transparent 70%)"
              }}
            />
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default RoletaRecompensasModal;

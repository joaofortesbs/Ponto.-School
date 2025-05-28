
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Gift, X, Sparkles } from "lucide-react";
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          style={{ pointerEvents: 'auto' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.4 
            }}
            className="backdrop-blur-md rounded-xl p-6 max-w-md w-full shadow-2xl border border-[#FF6B00]/30 relative overflow-hidden"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/* Efeitos visuais de fundo idênticos ao modal Bem-vindo de volta */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FF6B00]/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-20 w-40 h-40 bg-[#FF8C40]/10 rounded-full blur-3xl"></div>

            {/* Bolhas de efeito */}
            {[...Array(4)].map((_, i) => (
              <motion.div 
                key={i}
                className={`absolute w-24 h-24 rounded-full blur-3xl pointer-events-none opacity-30 ${
                  i === 0 ? "bg-[#FF6B00]/20 top-0 left-0" : ""
                }${
                  i === 1 ? "bg-[#FF8C40]/20 top-0 right-0" : ""
                }${
                  i === 2 ? "bg-indigo-500/10 bottom-0 right-0" : ""
                }${
                  i === 3 ? "bg-cyan-500/10 bottom-0 left-0" : ""
                }`}
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{ 
                  duration: 4 + i, 
                  ease: "easeInOut",
                  repeat: Infinity 
                }}
              />
            ))}

            {/* Linhas de grade de fundo - efeito Tron/cyberpunk */}
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-5"></div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="absolute top-3 right-3 rounded-full hover:bg-white/10 text-white z-10"
            >
              <X className="h-4 w-4" />
            </Button>

            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-6 pt-4 relative"
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  delay: 0.2,
                  duration: 0.7
                }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6B00]/20 to-[#FF8C40]/20 flex items-center justify-center mx-auto mb-5 relative"
              >
                <div className="absolute inset-0 rounded-full border border-[#FF6B00]/30 animate-pulse"></div>
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                    opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="absolute inset-1 rounded-full border-2 border-[#FF6B00]/20 border-t-[#FF8C40]"
                ></motion.div>
                <motion.div
                  animate={{ scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center"
                >
                  <Gift className="h-7 w-7 text-white" />
                </motion.div>
              </motion.div>

              <motion.h2 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2 text-shadow-sm"
              >
                <span>Resgate sua recompensa</span>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, delay: 1, repeat: 1 }}
                >
                  <Sparkles className="h-5 w-5 text-[#FF8C40]" />
                </motion.div>
              </motion.h2>
              <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-white text-shadow-sm"
              >
                Parabéns por manter sua sequência diária!
              </motion.p>
            </motion.div>

            {/* Botão Continue estilizado igual ao modal Bem-vindo */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex justify-center"
            >
              <motion.div
                initial={{ scale: 1 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(255, 107, 0, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 10 
                }}
              >
                <Button
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white px-8 py-6 text-lg font-medium shadow-lg shadow-[#FF6B00]/20 relative overflow-hidden group"
                  onClick={() => onOpenChange(false)}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Resgatar Agora
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                      <Gift className="h-4 w-4" />
                    </motion.div>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FF8C40] to-[#FF6B00] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Button>
              </motion.div>
            </motion.div>

            {/* Efeito de partículas flutuantes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-[#FF6B00]/40 rounded-full"
                  initial={{ 
                    x: Math.random() * 100 + "%", 
                    y: Math.random() * 100 + "%", 
                    opacity: 0 
                  }}
                  animate={{ 
                    y: [null, Math.random() * 100 + "%"],
                    opacity: [0, 0.7, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 3 + Math.random() * 5,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            {/* Efeitos decorativos adicionais */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-xl">
              {/* Partículas de recompensa */}
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
              className="absolute inset-0 rounded-xl opacity-30 pointer-events-none"
              style={{
                background: "radial-gradient(circle at 50% 50%, rgba(255, 107, 0, 0.1) 0%, transparent 70%)"
              }}
            />
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default RoletaRecompensasModal;

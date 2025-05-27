
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Sparkles,
  Music,
  PartyPopper,
  Palmtree,
  Ghost,
  Gift,
  Fireworks,
  Check,
  Star,
  Crown,
  Zap
} from "lucide-react";

interface ModoEventosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EventMode {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  description: string;
  particles: string;
  activated: boolean;
}

const ModoEventosModal: React.FC<ModoEventosModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [eventModes, setEventModes] = useState<EventMode[]>([
    {
      id: 'carnaval',
      name: 'Carnaval',
      icon: <Music className="h-8 w-8" />,
      color: '#FF6B00',
      gradient: 'from-yellow-400 via-orange-500 to-red-500',
      description: 'Transforme sua experiência com cores vibrantes e energia festiva',
      particles: '🎭🎪🎺',
      activated: false
    },
    {
      id: 'festa-junina',
      name: 'Festa Junina',
      icon: <PartyPopper className="h-8 w-8" />,
      color: '#8B5CF6',
      gradient: 'from-purple-500 via-pink-500 to-red-500',
      description: 'Ambiente caipira com decorações tradicionais e aconchegantes',
      particles: '🌽🎯🔥',
      activated: false
    },
    {
      id: 'ferias',
      name: 'Férias',
      icon: <Palmtree className="h-8 w-8" />,
      color: '#10B981',
      gradient: 'from-cyan-400 via-blue-500 to-purple-600',
      description: 'Relaxe com temas tropicais e atmosfera de descanso',
      particles: '🏖️☀️🌴',
      activated: false
    },
    {
      id: 'halloween',
      name: 'Halloween',
      icon: <Ghost className="h-8 w-8" />,
      color: '#F59E0B',
      gradient: 'from-orange-600 via-red-600 to-purple-900',
      description: 'Mergulhe no mistério com temas sombrios e envolventes',
      particles: '🎃👻🕷️',
      activated: false
    },
    {
      id: 'natal',
      name: 'Natal',
      icon: <Gift className="h-8 w-8" />,
      color: '#DC2626',
      gradient: 'from-red-500 via-green-500 to-red-600',
      description: 'Espalhe a magia natalina com cores festivas e acolhedoras',
      particles: '🎄❄️🎁',
      activated: false
    },
    {
      id: 'final-de-ano',
      name: 'Final de Ano',
      icon: <Fireworks className="h-8 w-8" />,
      color: '#6366F1',
      gradient: 'from-blue-500 via-purple-500 to-pink-500',
      description: 'Celebre com elegância e sofisticação dourada',
      particles: '🎆✨🥂',
      activated: false
    }
  ]);

  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const handleModeToggle = (modeId: string) => {
    setEventModes(prevModes =>
      prevModes.map(mode => ({
        ...mode,
        activated: mode.id === modeId ? !mode.activated : false
      }))
    );
    setSelectedMode(modeId);
  };

  const activeModes = eventModes.filter(mode => mode.activated);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-[#0A1628] dark:via-[#0F1B2E] dark:to-[#1E293B] border-2 border-gradient-to-r from-orange-400/20 to-purple-600/20 shadow-2xl backdrop-blur-xl">
        {/* Header Section */}
        <DialogHeader className="relative pb-6 border-b border-gradient-to-r from-orange-200/30 to-purple-200/30">
          <div className="flex items-center justify-center mb-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-purple-500 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-orange-500 to-purple-600 p-4 rounded-full shadow-xl">
                <Calendar className="h-10 w-10 text-white" />
              </div>
            </motion.div>
          </div>
          
          <DialogTitle className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Modo Eventos
              </span>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-500 animate-pulse" />
                <span className="text-lg text-muted-foreground font-medium">
                  Experiências Temáticas Exclusivas
                </span>
                <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
              </div>
            </motion.div>
          </DialogTitle>
          
          <DialogDescription className="text-center mt-2">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-base text-muted-foreground"
            >
              Transforme sua interface com temas sazonais únicos e envolventes
            </motion.p>
          </DialogDescription>

          {/* Active Mode Indicator */}
          {activeModes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 flex justify-center"
            >
              <Badge 
                className={`bg-gradient-to-r ${activeModes[0].gradient} text-white px-4 py-2 text-sm font-semibold shadow-lg`}
              >
                <Crown className="h-4 w-4 mr-2" />
                Modo {activeModes[0].name} Ativo
                <Zap className="h-4 w-4 ml-2" />
              </Badge>
            </motion.div>
          )}
        </DialogHeader>

        {/* Modes Grid */}
        <div className="py-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {eventModes.map((mode, index) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl blur-xl" 
                     style={{ background: `linear-gradient(135deg, ${mode.color}20, ${mode.color}40)` }}>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-500 cursor-pointer backdrop-blur-sm ${
                    mode.activated
                      ? `bg-gradient-to-br ${mode.gradient} text-white border-white/30 shadow-2xl`
                      : 'bg-white/70 dark:bg-slate-800/70 border-slate-200/50 dark:border-slate-600/50 hover:border-orange-300/50 dark:hover:border-orange-400/50 shadow-lg hover:shadow-xl'
                  }`}
                  onClick={() => handleModeToggle(mode.id)}
                >
                  {/* Particles Effect */}
                  <div className="absolute top-2 right-2 text-2xl opacity-60">
                    {mode.particles.split('').map((particle, i) => (
                      <motion.span
                        key={i}
                        animate={{
                          y: [0, -10, 0],
                          rotate: [0, 10, -10, 0],
                          opacity: [0.6, 1, 0.6]
                        }}
                        transition={{
                          duration: 3,
                          delay: i * 0.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="inline-block"
                        style={{ fontSize: '0.8rem' }}
                      >
                        {particle}
                      </motion.span>
                    ))}
                  </div>

                  {/* Mode Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`p-3 rounded-xl ${
                        mode.activated 
                          ? 'bg-white/20 backdrop-blur-sm' 
                          : `bg-gradient-to-br from-${mode.color}/10 to-${mode.color}/20`
                      }`}
                      style={{ 
                        color: mode.activated ? 'white' : mode.color,
                        backgroundColor: mode.activated ? 'rgba(255,255,255,0.2)' : undefined
                      }}
                    >
                      {mode.icon}
                    </motion.div>
                    
                    {mode.activated && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="bg-white/20 p-2 rounded-full backdrop-blur-sm"
                      >
                        <Check className="h-5 w-5 text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Mode Info */}
                  <div className="space-y-3">
                    <h3 className={`text-xl font-bold ${
                      mode.activated ? 'text-white' : 'text-slate-800 dark:text-white'
                    }`}>
                      {mode.name}
                    </h3>
                    
                    <p className={`text-sm leading-relaxed ${
                      mode.activated ? 'text-white/90' : 'text-muted-foreground'
                    }`}>
                      {mode.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <motion.div className="mt-4">
                    <Button
                      variant={mode.activated ? "secondary" : "outline"}
                      size="sm"
                      className={`w-full transition-all duration-300 ${
                        mode.activated
                          ? 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                          : 'hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-purple-500/10 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {mode.activated ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Modo Ativo
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4 mr-2" />
                          Ativar Modo
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gradient-to-r from-orange-200/30 to-purple-200/30">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex justify-between items-center"
          >
            <div className="text-sm text-muted-foreground">
              {activeModes.length > 0 ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  Modo temático ativo em toda a plataforma
                </span>
              ) : (
                <span>Nenhum modo ativo</span>
              )}
            </div>
            
            <div className="flex gap-3">
              {activeModes.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setEventModes(modes => modes.map(m => ({ ...m, activated: false })))}
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                >
                  Desativar Todos
                </Button>
              )}
              
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white shadow-lg"
              >
                Concluir
              </Button>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModoEventosModal;

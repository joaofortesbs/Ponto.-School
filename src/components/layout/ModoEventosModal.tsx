
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Sparkles,
  Zap,
  Star,
  Clock,
  Users,
  Trophy,
  Target,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModoEventosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EventMode {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  enabled: boolean;
  color: string;
  bgColor: string;
  neonColor: string;
}

export default function ModoEventosModal({
  isOpen,
  onClose,
}: ModoEventosModalProps) {
  const [eventModes, setEventModes] = useState<EventMode[]>([
    {
      id: "carnaval",
      name: "Carnaval",
      description: "Modo festivo e colorido",
      icon: Sparkles,
      gradient: "from-[#FF1493] to-[#FFD700]",
      color: "#FF1493",
      bgColor: "rgba(255, 20, 147, 0.1)",
      neonColor: "#FF1493",
      enabled: false,
    },
    {
      id: "festa-junina",
      name: "Festa Junina",
      description: "Temática rural e tradicional",
      icon: Star,
      gradient: "from-[#8B4513] to-[#FFD700]",
      color: "#8B4513",
      bgColor: "rgba(139, 69, 19, 0.1)",
      neonColor: "#FFD700",
      enabled: false,
    },
    {
      id: "ferias",
      name: "Férias",
      description: "Modo relaxante e descontraído",
      icon: Calendar,
      gradient: "from-[#00CED1] to-[#87CEEB]",
      color: "#00CED1",
      bgColor: "rgba(0, 206, 209, 0.1)",
      neonColor: "#00CED1",
      enabled: false,
    },
    {
      id: "ponto-school",
      name: "Ponto. School",
      description: "Modo padrão da plataforma",
      icon: Target,
      gradient: "from-[#FF6B00] to-[#FF8C40]",
      color: "#FF6B00",
      bgColor: "rgba(255, 107, 0, 0.1)",
      neonColor: "#FF6B00",
      enabled: true,
    },
    {
      id: "halloween",
      name: "Halloween",
      description: "Modo misterioso e divertido",
      icon: Zap,
      gradient: "from-[#800080] to-[#FF4500]",
      color: "#800080",
      bgColor: "rgba(128, 0, 128, 0.1)",
      neonColor: "#800080",
      enabled: false,
    },
    {
      id: "natal",
      name: "Natal",
      description: "Modo natalino e acolhedor",
      icon: Star,
      gradient: "from-[#DC143C] to-[#228B22]",
      color: "#DC143C",
      bgColor: "rgba(220, 20, 60, 0.1)",
      neonColor: "#DC143C",
      enabled: false,
    },
    {
      id: "final-ano",
      name: "Final de Ano",
      description: "Modo celebrativo e reflexivo",
      icon: Trophy,
      gradient: "from-[#FFD700] to-[#FF6B00]",
      color: "#FFD700",
      bgColor: "rgba(255, 215, 0, 0.1)",
      neonColor: "#FFD700",
      enabled: false,
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(3); // Centraliza no card "Ponto. School"
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Função para ativar apenas um modo por vez
  const toggleEventMode = (id: string) => {
    if (id === 'ponto-school') return; // Ponto. School não pode ser desativado
    
    setEventModes(prev =>
      prev.map(mode => ({
        ...mode,
        enabled: mode.id === id ? !mode.enabled : mode.id === 'ponto-school' ? true : false
      }))
    );
  };

  // Função para calcular posição e estilo de cada card
  const getCardStyle = (index: number) => {
    const distance = index - currentIndex;
    const isCenter = distance === 0;
    const absDistance = Math.abs(distance);
    
    // Posição X baseada na distância do centro
    const baseSpacing = 160;
    const x = distance * baseSpacing;
    
    // Escala baseada na distância (centro = 1, outros diminuem)
    const scale = isCenter ? 1.2 : Math.max(0.6, 1 - absDistance * 0.15);
    
    // Rotação Y para efeito de perspectiva 3D
    const rotateY = isCenter ? 0 : distance * -15;
    
    // Z-index para sobreposição correta
    const zIndex = isCenter ? 10 : Math.max(1, 5 - absDistance);
    
    // Opacidade baseada na distância
    const opacity = isCenter ? 1 : Math.max(0.4, 1 - absDistance * 0.3);
    
    // Blur para simular profundidade
    const blur = isCenter ? 0 : Math.min(absDistance * 2, 6);

    return {
      x,
      scale,
      rotateY,
      zIndex,
      opacity,
      filter: `blur(${blur}px)`,
    };
  };

  // Navegação para o próximo item
  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % eventModes.length);
  };

  // Navegação para o item anterior
  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + eventModes.length) % eventModes.length);
  };

  // Controle de scroll do mouse
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  };

  // Controle de drag
  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 50;
    
    if (info.offset.x > threshold) {
      prevSlide();
    } else if (info.offset.x < -threshold) {
      nextSlide();
    }
  };

  // Easing customizado
  const customEasing = [0.25, 0.8, 0.25, 1];

  // Encontrar o modo ativo atual
  const activeModes = eventModes.filter(mode => mode.enabled);
  const activeMode = activeModes.length > 0 ? activeModes[0] : eventModes.find(m => m.id === 'ponto-school');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[900px] h-[650px] max-w-none p-0 border-0 bg-transparent overflow-hidden">
        <div className="relative w-full h-full">
          {/* Background com estilo do modal de boas-vindas */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xl rounded-3xl border border-[#FF6B00]/30 shadow-[0_0_100px_rgba(255,107,0,0.2)]">
            {/* Glassmorphism overlay com tom laranja */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/10 via-black/20 to-[#FF8C40]/5 rounded-3xl" />
            
            {/* Grid sutil */}
            <div 
              className="absolute inset-0 opacity-[0.02] rounded-3xl"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255, 107, 0, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255, 107, 0, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}
            />
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-6 right-6 z-50 h-9 w-9 rounded-full bg-black/20 hover:bg-black/30 border border-[#FF6B00]/20 text-white/60 hover:text-white transition-all duration-700 group backdrop-blur-sm"
          >
            <X className="h-4 w-4 group-hover:rotate-90 transition-transform duration-700" />
          </Button>

          {/* Main content */}
          <div className="relative z-10 h-full flex flex-col px-8 py-6">
            {/* Header */}
            <DialogHeader className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <motion.div 
                  className="relative"
                  animate={{ rotateY: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="relative bg-[#FF6B00]/10 p-5 rounded-2xl border border-[#FF6B00]/20 backdrop-blur-sm">
                    <Calendar className="h-8 w-8 text-[#FF6B00]" />
                    
                    {/* Orbiting elements */}
                    <motion.div 
                      className="absolute -top-1.5 -right-1.5 bg-[#FFD700]/10 p-1 rounded-lg border border-[#FFD700]/20 backdrop-blur-sm"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-2.5 w-2.5 text-[#FFD700]" />
                    </motion.div>
                    <motion.div 
                      className="absolute -bottom-1.5 -left-1.5 bg-[#FF8C40]/10 p-1 rounded-lg border border-[#FF8C40]/20 backdrop-blur-sm"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="h-2.5 w-2.5 text-[#FF8C40]" />
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              <DialogTitle className="text-center">
                <motion.h1 
                  className="text-4xl font-light bg-gradient-to-r from-[#FFFFFF] via-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent leading-tight tracking-wide mb-3"
                  animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  Modo Eventos
                </motion.h1>
                <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#FF6B00]/30 to-transparent mx-auto" />
              </DialogTitle>
            </DialogHeader>

            {/* CARROSSEL 3D INTERATIVO */}
            <div className="flex-1 flex items-center justify-center relative">
              {/* Navigation arrows */}
              <motion.button
                onClick={prevSlide}
                className="absolute left-8 z-20 h-12 w-12 rounded-full bg-black/20 hover:bg-black/30 border border-[#FF6B00]/20 text-white/60 hover:text-white transition-all duration-700 backdrop-blur-sm shadow-lg flex items-center justify-center group"
                whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(255, 107, 0, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform duration-300" />
              </motion.button>

              {/* 3D Carousel Container */}
              <div 
                ref={containerRef}
                className="relative w-full h-80 flex items-center justify-center"
                style={{ perspective: '1200px' }}
                onWheel={handleWheel}
              >
                <motion.div
                  className="relative flex items-center justify-center"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={handleDragEnd}
                  dragElastic={0.1}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {eventModes.map((mode, index) => {
                    const IconComponent = mode.icon;
                    const style = getCardStyle(index);
                    const isCenter = index === currentIndex;
                    
                    return (
                      <motion.div
                        key={mode.id}
                        className={`absolute cursor-pointer ${isCenter ? 'pointer-events-auto' : 'pointer-events-none'}`}
                        style={{
                          transformStyle: 'preserve-3d',
                        }}
                        animate={{
                          x: style.x,
                          scale: style.scale,
                          rotateY: style.rotateY,
                          zIndex: style.zIndex,
                          opacity: style.opacity,
                          filter: style.filter,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                          mass: 0.8,
                        }}
                        whileHover={isCenter ? { 
                          scale: style.scale * 1.05,
                          rotateY: style.rotateY + 2,
                        } : {}}
                        onClick={() => {
                          if (isCenter && mode.id !== 'ponto-school') {
                            toggleEventMode(mode.id);
                          } else if (!isCenter) {
                            setCurrentIndex(index);
                          }
                        }}
                      >
                        {/* Glassmorphism Card */}
                        <div
                          className="relative rounded-3xl p-6 backdrop-blur-xl border transition-all duration-500"
                          style={{
                            width: '200px',
                            height: '280px',
                            background: `linear-gradient(135deg, 
                              rgba(255, 107, 0, ${isCenter ? 0.08 : 0.04}) 0%, 
                              rgba(0, 0, 0, ${isCenter ? 0.6 : 0.4}) 100%)`,
                            borderColor: mode.enabled ? `${mode.neonColor}60` : 'rgba(255, 107, 0, 0.2)',
                            boxShadow: isCenter 
                              ? `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px ${mode.neonColor}40`
                              : '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                          }}
                        >
                          {/* Neon pulsing border */}
                          {isCenter && mode.enabled && (
                            <motion.div
                              className="absolute inset-0 rounded-3xl"
                              style={{
                                background: `linear-gradient(45deg, ${mode.neonColor}40, transparent, ${mode.neonColor}40)`,
                                backgroundSize: '200% 200%',
                              }}
                              animate={{
                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                                opacity: [0.3, 0.8, 0.3],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            />
                          )}

                          {/* Card Content */}
                          <div className="relative flex flex-col items-center text-center h-full justify-center space-y-4">
                            {/* Animated Icon */}
                            <motion.div 
                              className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
                              style={{
                                background: `linear-gradient(135deg, ${mode.color}40, ${mode.color}20)`,
                                border: `2px solid ${mode.color}50`,
                                boxShadow: isCenter ? `0 0 20px ${mode.color}60` : `0 0 10px ${mode.color}30`,
                              }}
                              animate={isCenter ? {
                                rotate: [0, 5, -5, 0],
                                scale: [1, 1.1, 1],
                              } : {}}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            >
                              <IconComponent 
                                className="h-8 w-8" 
                                style={{ color: mode.color }}
                              />
                              
                              {/* Icon glow effect */}
                              {isCenter && (
                                <div 
                                  className="absolute inset-0 rounded-2xl animate-pulse"
                                  style={{
                                    background: `radial-gradient(circle, ${mode.color}30 0%, transparent 70%)`,
                                  }}
                                />
                              )}
                            </motion.div>
                            
                            {/* Text Content */}
                            <div className="space-y-2">
                              <h4 className="text-lg font-semibold text-white">{mode.name}</h4>
                              <p className="text-white/70 text-sm font-light leading-relaxed">
                                {mode.description}
                              </p>
                            </div>

                            {/* Toggle/Status */}
                            {mode.id !== 'ponto-school' ? (
                              <motion.div 
                                className="relative"
                                whileHover={isCenter ? { scale: 1.1 } : {}}
                              >
                                <div 
                                  className="w-14 h-7 rounded-full border-2 transition-all duration-500 relative flex items-center"
                                  style={{
                                    backgroundColor: mode.enabled ? `${mode.color}30` : 'rgba(0, 0, 0, 0.3)',
                                    borderColor: mode.enabled ? `${mode.color}80` : 'rgba(255, 107, 0, 0.2)',
                                    boxShadow: mode.enabled ? `0 0 15px ${mode.color}50` : 'none',
                                  }}
                                >
                                  <motion.div 
                                    className="w-5 h-5 rounded-full shadow-lg flex items-center justify-center"
                                    style={{
                                      background: mode.enabled 
                                        ? `linear-gradient(135deg, ${mode.color}, ${mode.color}CC)` 
                                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.3))'
                                    }}
                                    animate={{
                                      x: mode.enabled ? 22 : 2,
                                    }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 500,
                                      damping: 30,
                                    }}
                                  >
                                    {mode.enabled && (
                                      <Check className="h-3 w-3 text-white" />
                                    )}
                                  </motion.div>
                                </div>
                              </motion.div>
                            ) : (
                              <div 
                                className="px-4 py-2 rounded-full border-2 text-xs font-semibold flex items-center justify-center"
                                style={{
                                  borderColor: mode.color,
                                  backgroundColor: `${mode.color}20`,
                                  color: mode.color,
                                  boxShadow: `0 0 15px ${mode.color}40`,
                                }}
                              >
                                ATIVO
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>

              {/* Navigation arrows */}
              <motion.button
                onClick={nextSlide}
                className="absolute right-8 z-20 h-12 w-12 rounded-full bg-black/20 hover:bg-black/30 border border-[#FF6B00]/20 text-white/60 hover:text-white transition-all duration-700 backdrop-blur-sm shadow-lg flex items-center justify-center group"
                whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(255, 107, 0, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </div>

            {/* Indicators */}
            <div className="flex justify-center space-x-2 mt-6 mb-6">
              {eventModes.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className="w-2 h-2 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: index === currentIndex ? '#FF6B00' : 'rgba(255, 107, 0, 0.3)',
                    boxShadow: index === currentIndex ? '0 0 10px #FF6B0080' : 'none',
                  }}
                  whileHover={{ scale: 1.5 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="flex flex-col items-center space-y-4">
              {/* Modo Ativo Display - Estilo ultra sofisticado */}
              {activeMode && (
                <motion.div 
                  className="flex items-center gap-4 px-6 py-4 bg-black/20 border border-[#FF6B00]/20 rounded-2xl backdrop-blur-sm"
                  animate={{ 
                    boxShadow: ['0 0 20px rgba(255, 107, 0, 0.2)', '0 0 30px rgba(255, 107, 0, 0.4)', '0 0 20px rgba(255, 107, 0, 0.2)']
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {/* Ícone do modo ativo */}
                  <motion.div
                    className="w-10 h-10 rounded-xl flex items-center justify-center relative"
                    style={{
                      background: `linear-gradient(135deg, ${activeMode.color}40, ${activeMode.color}20)`,
                      border: `2px solid ${activeMode.color}60`,
                      boxShadow: `0 0 15px ${activeMode.color}40`,
                    }}
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <activeMode.icon 
                      className="h-5 w-5" 
                      style={{ color: activeMode.color }}
                    />
                  </motion.div>
                  
                  {/* Nome e status */}
                  <div className="flex flex-col">
                    <span className="text-white font-semibold text-lg">
                      {activeMode.name}
                    </span>
                    <span className="text-white/60 text-sm">
                      Modo ativo atual
                    </span>
                  </div>
                  
                  {/* Indicador de status */}
                  <motion.div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: activeMode.color }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-4">
                <motion.button
                  onClick={onClose}
                  className="px-6 py-3 bg-transparent border border-[#FF6B00]/30 text-white/80 hover:text-white hover:border-[#FF6B00]/60 transition-all duration-500 rounded-xl backdrop-blur-sm font-light text-sm"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 5px 15px rgba(255, 107, 0, 0.2)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  className="px-6 py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white border-0 rounded-xl font-light text-sm relative overflow-hidden"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 25px rgba(255, 107, 0, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#FF8C40] to-[#FFD700]"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10">Aplicar Configurações</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

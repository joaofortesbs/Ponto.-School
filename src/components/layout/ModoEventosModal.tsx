
import React, { useState, useRef, useEffect } from "react";
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
      enabled: false,
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(3); // Centraliza no card "Ponto. School"
  const carouselRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  const toggleEventMode = (id: string) => {
    setEventModes(prev =>
      prev.map(mode =>
        mode.id === id ? { ...mode, enabled: !mode.enabled } : mode
      )
    );
  };

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const cardWidth = 200; // largura do card (180px) + gap (20px)
      const containerWidth = container.offsetWidth;
      const totalCards = eventModes.length;
      
      // Calcula a posição central
      const targetScroll = (index * cardWidth) - (containerWidth / 2) + (cardWidth / 2);
      
      container.scrollTo({
        left: Math.max(0, Math.min(targetScroll, (totalCards * cardWidth) - containerWidth)),
        behavior: 'smooth'
      });
    }
  };

  const nextSlide = () => {
    const newIndex = currentIndex < eventModes.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    scrollToIndex(newIndex);
  };

  const prevSlide = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : eventModes.length - 1;
    setCurrentIndex(newIndex);
    scrollToIndex(newIndex);
  };

  // Scroll com mouse wheel
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (carouselRef.current && !isScrolling.current) {
        e.preventDefault();
        isScrolling.current = true;
        
        if (e.deltaY > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        
        setTimeout(() => {
          isScrolling.current = false;
        }, 300);
      }
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('wheel', handleWheel, { passive: false });
      return () => carousel.removeEventListener('wheel', handleWheel);
    }
  }, [currentIndex]);

  // Inicializar posição central
  useEffect(() => {
    if (isOpen && carouselRef.current) {
      setTimeout(() => {
        scrollToIndex(currentIndex);
      }, 100);
    }
  }, [isOpen]);

  const enabledCount = eventModes.filter(mode => mode.enabled).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[900px] h-[600px] max-w-none p-0 border-0 bg-transparent overflow-hidden">
        <div className="relative w-full h-full">
          {/* Ultra-sophisticated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F1C] via-[#1A1F2E] to-[#0D1117] rounded-3xl border border-[#FF6B00]/10 shadow-[0_0_100px_rgba(255,107,0,0.1)] backdrop-blur-3xl">
            {/* Minimalist geometric patterns */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              {/* Subtle grid overlay */}
              <div 
                className="absolute inset-0 opacity-[0.02]"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255, 107, 0, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 107, 0, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px'
                }}
              />
              
              {/* Floating elements - ultra minimal */}
              <div className="absolute top-20 left-16 w-1 h-1 bg-[#FF6B00]/30 rounded-full animate-pulse" />
              <div className="absolute top-32 right-24 w-0.5 h-0.5 bg-[#FF8C40]/40 rounded-full animate-ping" 
                   style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-28 left-32 w-1.5 h-1.5 bg-[#FFD700]/20 rounded-full animate-pulse" 
                   style={{ animationDelay: '2s' }} />
              <div className="absolute bottom-40 right-20 w-0.5 h-0.5 bg-[#FF6B00]/25 rounded-full animate-ping"
                   style={{ animationDelay: '3s' }} />
            </div>

            {/* Sophisticated glow effects */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[600px] h-[300px] bg-[#FF6B00]/[0.03] rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[200px] bg-[#FF8C40]/[0.02] rounded-full blur-3xl" />
          </div>

          {/* Ultra-minimal close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-6 right-6 z-50 h-9 w-9 rounded-full bg-black/10 hover:bg-black/20 border border-white/5 text-white/60 hover:text-white transition-all duration-700 group backdrop-blur-sm"
          >
            <X className="h-4 w-4 group-hover:rotate-90 transition-transform duration-700" />
          </Button>

          {/* Main content */}
          <div className="relative z-10 h-full flex flex-col px-8 py-5">
            {/* Ultra-sophisticated header */}
            <DialogHeader className="text-center mb-6">
              {/* Central sophisticated icon */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  {/* Main icon container */}
                  <div className="relative bg-gradient-to-br from-[#FF6B00]/10 to-[#FF8C40]/5 p-5 rounded-2xl border border-[#FF6B00]/10 backdrop-blur-sm">
                    <Calendar className="h-8 w-8 text-[#FF6B00]" />
                    
                    {/* Subtle orbiting elements */}
                    <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-[#FFD700]/20 to-[#FF8C40]/10 p-1 rounded-lg border border-[#FFD700]/20 backdrop-blur-sm">
                      <Sparkles className="h-2.5 w-2.5 text-[#FFD700]" />
                    </div>
                    <div className="absolute -bottom-1.5 -left-1.5 bg-gradient-to-br from-[#FF8C40]/20 to-[#FF6B00]/10 p-1 rounded-lg border border-[#FF8C40]/20 backdrop-blur-sm">
                      <Zap className="h-2.5 w-2.5 text-[#FF8C40]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ultra-elegant title */}
              <DialogTitle className="text-center">
                <h1 className="text-4xl font-light bg-gradient-to-r from-[#FFFFFF] via-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent leading-tight tracking-wide mb-3">
                  Modo Eventos
                </h1>
                <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#FF6B00]/30 to-transparent mx-auto" />
              </DialogTitle>
            </DialogHeader>

            {/* Carrossel interativo */}
            <div className="flex-1 flex items-center justify-center relative">
              {/* Botão anterior */}
              <Button
                variant="ghost"
                size="icon"
                onClick={prevSlide}
                className="absolute left-8 z-20 h-12 w-12 rounded-full bg-black/20 hover:bg-black/30 border border-white/10 text-white/60 hover:text-white transition-all duration-700 backdrop-blur-sm shadow-lg hover:shadow-[#FF6B00]/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              {/* Container do carrossel com scroll personalizado */}
              <div 
                ref={carouselRef}
                className="flex overflow-x-auto scrollbar-hide gap-5 px-16 py-6 w-full"
                style={{
                  scrollBehavior: 'smooth',
                  scrollSnapType: 'x mandatory'
                }}
              >
                {eventModes.map((mode, index) => {
                  const IconComponent = mode.icon;
                  const isCenter = index === currentIndex;
                  
                  return (
                    <div
                      key={mode.id}
                      className={`group relative flex-shrink-0 bg-gradient-to-br from-white/[0.03] to-white/[0.08] rounded-2xl p-5 border transition-all duration-500 cursor-pointer backdrop-blur-sm transform ${
                        isCenter 
                          ? 'scale-110 z-10 shadow-2xl shadow-[#FF6B00]/30' 
                          : 'scale-90 opacity-60 hover:opacity-80 hover:scale-95'
                      }`}
                      style={{
                        width: '180px',
                        height: '240px',
                        borderColor: mode.enabled ? `${mode.color}50` : 'rgba(255, 255, 255, 0.08)',
                        backgroundColor: mode.enabled ? mode.bgColor : 'transparent',
                        scrollSnapAlign: 'center'
                      }}
                      onClick={() => {
                        setCurrentIndex(index);
                        scrollToIndex(index);
                        if (mode.id !== 'ponto-school') {
                          toggleEventMode(mode.id);
                        }
                      }}
                    >
                      {/* Glow effect personalizado */}
                      <div 
                        className={`absolute inset-0 rounded-2xl transition-opacity duration-700 ${
                          mode.enabled ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                        }`}
                        style={{
                          background: `radial-gradient(circle at center, ${mode.color}15 0%, transparent 70%)`
                        }}
                      />

                      {/* Indicador de card central */}
                      {isCenter && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-full" />
                      )}

                      <div className="relative flex flex-col items-center text-center space-y-4 h-full justify-center">
                        {/* Ícone principal */}
                        <div 
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                            isCenter ? 'scale-110' : 'group-hover:scale-105'
                          }`}
                          style={{
                            background: `linear-gradient(135deg, ${mode.color}40, ${mode.color}20)`,
                            border: `1px solid ${mode.color}30`
                          }}
                        >
                          <IconComponent 
                            className="h-6 w-6 text-white" 
                            style={{ color: mode.color }}
                          />
                        </div>
                        
                        {/* Conteúdo */}
                        <div className="space-y-2">
                          <h4 className="text-base font-medium text-white text-center">{mode.name}</h4>
                          <p className="text-white/60 text-xs font-light leading-relaxed text-center">
                            {mode.description}
                          </p>
                        </div>

                        {/* Toggle sofisticado - apenas se não for Ponto. School */}
                        {mode.id !== 'ponto-school' ? (
                          <div className="relative">
                            <div 
                              className="w-12 h-6 rounded-full border transition-all duration-500 relative"
                              style={{
                                backgroundColor: mode.enabled ? `${mode.color}20` : 'rgba(0, 0, 0, 0.2)',
                                borderColor: mode.enabled ? `${mode.color}60` : 'rgba(255, 255, 255, 0.1)'
                              }}
                            >
                              <div 
                                className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-500 shadow-lg flex items-center justify-center"
                                style={{
                                  left: mode.enabled ? '26px' : '2px',
                                  background: mode.enabled 
                                    ? `linear-gradient(135deg, ${mode.color}, ${mode.color}CC)` 
                                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2))'
                                }}
                              >
                                {mode.enabled && (
                                  <Check className="h-2.5 w-2.5 text-white" />
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="w-12 h-6 rounded-full border-2 border-[#FF6B00] bg-[#FF6B00]/20 flex items-center justify-center">
                              <div className="text-[#FF6B00] text-xs font-semibold">ATIVO</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botão próximo */}
              <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                className="absolute right-8 z-20 h-12 w-12 rounded-full bg-black/20 hover:bg-black/30 border border-white/10 text-white/60 hover:text-white transition-all duration-700 backdrop-blur-sm shadow-lg hover:shadow-[#FF6B00]/20"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Indicadores de slide */}
            <div className="flex justify-center space-x-2 mt-4 mb-4">
              {eventModes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    scrollToIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-700 ${
                    index === currentIndex
                      ? 'bg-[#FF6B00] scale-125 shadow-lg shadow-[#FF6B00]/50'
                      : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            {/* Status e botões de ação */}
            <div className="flex flex-col items-center space-y-4">
              {/* Status indicator */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/10 border border-white/5 rounded-full backdrop-blur-sm">
                <div className={`w-1.5 h-1.5 rounded-full ${enabledCount > 0 ? 'bg-[#FF6B00]' : 'bg-white/20'} transition-colors duration-700`} />
                <span className="text-white/70 text-xs font-light">
                  {enabledCount} {enabledCount === 1 ? 'modo ativado' : 'modos ativados'}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="px-6 py-2 bg-transparent border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all duration-700 rounded-xl backdrop-blur-sm font-light text-sm"
                >
                  Cancelar
                </Button>
                <Button
                  className="px-6 py-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white hover:from-[#FF8C40] hover:to-[#FFD700] border-0 transition-all duration-700 shadow-lg hover:shadow-[#FF6B00]/20 rounded-xl font-light text-sm"
                >
                  Aplicar Configurações
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

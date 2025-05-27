
import React, { useState } from "react";
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
      enabled: false,
    },
    {
      id: "festa-junina",
      name: "Festa Junina",
      description: "Temática rural e tradicional",
      icon: Star,
      gradient: "from-[#8B4513] to-[#FFD700]",
      enabled: false,
    },
    {
      id: "ferias",
      name: "Férias",
      description: "Modo relaxante e descontraído",
      icon: Calendar,
      gradient: "from-[#00CED1] to-[#87CEEB]",
      enabled: false,
    },
    {
      id: "halloween",
      name: "Halloween",
      description: "Modo misterioso e divertido",
      icon: Zap,
      gradient: "from-[#800080] to-[#FF4500]",
      enabled: false,
    },
    {
      id: "natal",
      name: "Natal",
      description: "Modo natalino e acolhedor",
      icon: Star,
      gradient: "from-[#DC143C] to-[#228B22]",
      enabled: false,
    },
    {
      id: "final-ano",
      name: "Final de Ano",
      description: "Modo celebrativo e reflexivo",
      icon: Trophy,
      gradient: "from-[#FFD700] to-[#FF6B00]",
      enabled: false,
    },
  ]);

  const toggleEventMode = (id: string) => {
    setEventModes(prev =>
      prev.map(mode =>
        mode.id === id ? { ...mode, enabled: !mode.enabled } : mode
      )
    );
  };

  const enabledCount = eventModes.filter(mode => mode.enabled).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-w-[95vw] h-[90vh] p-0 border-0 bg-transparent overflow-hidden">
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
            className="absolute top-6 right-6 z-50 h-9 w-9 rounded-full bg-black/10 hover:bg-black/20 border border-white/5 text-white/60 hover:text-white transition-all duration-500 group backdrop-blur-sm"
          >
            <X className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
          </Button>

          {/* Main content */}
          <div className="relative z-10 h-full flex flex-col px-12 py-10">
            {/* Ultra-sophisticated header */}
            <DialogHeader className="text-center mb-12">
              {/* Central sophisticated icon */}
              <div className="flex items-center justify-center mb-8">
                <div className="relative">
                  {/* Main icon container */}
                  <div className="relative bg-gradient-to-br from-[#FF6B00]/10 to-[#FF8C40]/5 p-8 rounded-2xl border border-[#FF6B00]/10 backdrop-blur-sm">
                    <Calendar className="h-10 w-10 text-[#FF6B00]" />
                    
                    {/* Subtle orbiting elements */}
                    <div className="absolute -top-2 -right-2 bg-gradient-to-br from-[#FFD700]/20 to-[#FF8C40]/10 p-1.5 rounded-lg border border-[#FFD700]/20 backdrop-blur-sm">
                      <Sparkles className="h-3 w-3 text-[#FFD700]" />
                    </div>
                    <div className="absolute -bottom-2 -left-2 bg-gradient-to-br from-[#FF8C40]/20 to-[#FF6B00]/10 p-1.5 rounded-lg border border-[#FF8C40]/20 backdrop-blur-sm">
                      <Zap className="h-3 w-3 text-[#FF8C40]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ultra-elegant title */}
              <DialogTitle className="text-center">
                <h1 className="text-5xl font-light bg-gradient-to-r from-[#FFFFFF] via-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent leading-tight tracking-wide mb-4">
                  Modo Eventos
                </h1>
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#FF6B00]/30 to-transparent mx-auto" />
              </DialogTitle>
            </DialogHeader>

            {/* Content area */}
            <div className="flex-1 flex flex-col">
              {/* Status indicator */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-black/10 border border-white/5 rounded-full backdrop-blur-sm">
                  <div className={`w-2 h-2 rounded-full ${enabledCount > 0 ? 'bg-[#FF6B00]' : 'bg-white/20'} transition-colors duration-300`} />
                  <span className="text-white/70 text-sm font-light">
                    {enabledCount} modos ativados
                  </span>
                </div>
              </div>

              {/* Ultra-sophisticated events grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto flex-1">
                {eventModes.map((mode) => {
                  const IconComponent = mode.icon;
                  return (
                    <div
                      key={mode.id}
                      className={`group relative bg-gradient-to-br from-white/[0.02] to-white/[0.05] rounded-2xl p-6 border transition-all duration-500 cursor-pointer backdrop-blur-sm ${
                        mode.enabled
                          ? 'border-[#FF6B00]/30 bg-gradient-to-br from-[#FF6B00]/[0.05] to-[#FF8C40]/[0.02]'
                          : 'border-white/[0.08] hover:border-white/20'
                      }`}
                      onClick={() => toggleEventMode(mode.id)}
                    >
                      {/* Subtle hover glow */}
                      <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${
                        mode.enabled ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                      }`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B00]/[0.02] to-[#FF8C40]/[0.01] rounded-2xl" />
                      </div>

                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          {/* Ultra-minimal icon */}
                          <div className={`w-14 h-14 bg-gradient-to-br ${mode.gradient} rounded-xl flex items-center justify-center opacity-90 transition-all duration-300 group-hover:opacity-100`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          
                          <div>
                            <h4 className="text-xl font-light text-white mb-1">{mode.name}</h4>
                            <p className="text-white/50 text-sm font-light">{mode.description}</p>
                          </div>
                        </div>

                        {/* Ultra-sophisticated toggle */}
                        <div className="relative">
                          <div className={`w-12 h-7 rounded-full border transition-all duration-500 ${
                            mode.enabled
                              ? 'bg-[#FF6B00]/20 border-[#FF6B00]/40'
                              : 'bg-black/20 border-white/10'
                          }`}>
                            <div className={`absolute top-0.5 w-6 h-6 bg-gradient-to-br rounded-full transition-all duration-500 shadow-lg ${
                              mode.enabled
                                ? 'left-5 from-[#FF6B00] to-[#FF8C40]'
                                : 'left-0.5 from-white/40 to-white/20'
                            }`}>
                              {mode.enabled && (
                                <Check className="h-3 w-3 text-white absolute top-1.5 left-1.5" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ultra-minimal action buttons */}
              <div className="flex items-center justify-center gap-6 mt-12">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="px-8 py-3 bg-transparent border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all duration-500 rounded-xl backdrop-blur-sm font-light"
                >
                  Cancelar
                </Button>
                <Button
                  className="px-8 py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white hover:from-[#FF8C40] hover:to-[#FFD700] border-0 transition-all duration-500 shadow-lg hover:shadow-[#FF6B00]/20 rounded-xl font-light"
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

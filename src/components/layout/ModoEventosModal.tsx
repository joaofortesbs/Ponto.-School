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
  Music,
  Sun,
  Palmtree,
  Ghost,
  TreePine,
  Fireworks,
  Check,
  Settings,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface ModoEventosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EventMode {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  isActive: boolean;
  features: string[];
}

export default function ModoEventosModal({
  isOpen,
  onClose,
}: ModoEventosModalProps) {
  const [eventModes, setEventModes] = useState<EventMode[]>([
    {
      id: "carnaval",
      name: "Carnaval",
      description: "Transforme seus estudos em uma festa colorida e animada",
      icon: <Music className="h-8 w-8" />,
      color: "#FF6B00",
      gradientFrom: "#FF6B00",
      gradientTo: "#FFD700",
      accentColor: "#FF8C40",
      isActive: false,
      features: ["Animações festivas", "Sons de carnaval", "Cores vibrantes", "Confetes animados"]
    },
    {
      id: "festa-junina",
      name: "Festa Junina",
      description: "Celebre o aprendizado com o charme das festas juninas",
      icon: <Sun className="h-8 w-8" />,
      color: "#FF8C40",
      gradientFrom: "#FF8C40",
      gradientTo: "#FFB84D",
      accentColor: "#FFA500",
      isActive: false,
      features: ["Decoração junina", "Fogueira animada", "Bandeirinhas", "Sons tradicionais"]
    },
    {
      id: "ferias",
      name: "Férias",
      description: "Mantenha o ritmo de estudos com leveza e diversão",
      icon: <Palmtree className="h-8 w-8" />,
      color: "#00CED1",
      gradientFrom: "#00CED1",
      gradientTo: "#40E0D0",
      accentColor: "#20B2AA",
      isActive: false,
      features: ["Tema tropical", "Ondas do mar", "Palmas balançando", "Sons relaxantes"]
    },
    {
      id: "halloween",
      name: "Halloween",
      description: "Estudos assombrosamente eficazes para uma noite especial",
      icon: <Ghost className="h-8 w-8" />,
      color: "#8B4513",
      gradientFrom: "#8B4513",
      gradientTo: "#FF4500",
      accentColor: "#D2691E",
      isActive: false,
      features: ["Atmosfera sombria", "Abóboras animadas", "Morcegos voando", "Sons misteriosos"]
    },
    {
      id: "natal",
      name: "Natal",
      description: "Espalhe a magia natalina em seus momentos de aprendizado",
      icon: <TreePine className="h-8 w-8" />,
      color: "#228B22",
      gradientFrom: "#228B22",
      gradientTo: "#32CD32",
      accentColor: "#DC143C",
      isActive: false,
      features: ["Árvore de natal", "Neve caindo", "Luzes piscando", "Músicas natalinas"]
    },
    {
      id: "final-de-ano",
      name: "Final de Ano",
      description: "Celebre suas conquistas com fogos de artifício virtuais",
      icon: <Fireworks className="h-8 w-8" />,
      color: "#4B0082",
      gradientFrom: "#4B0082",
      gradientTo: "#9400D3",
      accentColor: "#FFD700",
      isActive: false,
      features: ["Fogos de artifício", "Contagem regressiva", "Efeitos dourados", "Celebração"]
    }
  ]);

  const [activeMode, setActiveMode] = useState<string | null>(null);

  const toggleEventMode = (modeId: string) => {
    setEventModes(prev => prev.map(mode => ({
      ...mode,
      isActive: mode.id === modeId ? !mode.isActive : false
    })));

    const selectedMode = eventModes.find(mode => mode.id === modeId);
    if (selectedMode?.isActive) {
      setActiveMode(null);
    } else {
      setActiveMode(modeId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] max-h-[95vh] p-0 border-0 bg-transparent overflow-hidden">
        <div className="relative w-full h-full">
          {/* Background Container */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 rounded-2xl border border-orange-500/30 shadow-2xl">
            {/* Animated Background Effects */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              {/* Grid Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-400/10 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>

              {/* Floating Particles */}
              <div className="absolute top-20 left-20 w-3 h-3 bg-orange-500 rounded-full animate-bounce opacity-60"></div>
              <div className="absolute top-32 right-24 w-2 h-2 bg-orange-400 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-24 left-32 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse opacity-50" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-40 right-20 w-2 h-2 bg-orange-500 rounded-full animate-ping opacity-30" style={{ animationDelay: '1.5s' }}></div>
            </div>

            {/* Glow Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-400/5 rounded-2xl"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl opacity-40 animate-pulse"></div>
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 h-10 w-10 rounded-xl bg-black/20 hover:bg-black/40 border border-white/20 text-white hover:text-orange-500 transition-all duration-300 backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Main Content */}
          <div className="relative z-10 h-full flex flex-col p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <DialogHeader>
                {/* Icon Section */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-xl border border-orange-400/40">
                      <Calendar className="h-10 w-10 text-white" />
                    </div>

                    {/* Orbiting Elements */}
                    <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-xl animate-bounce shadow-lg">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -left-2 bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-xl animate-pulse shadow-lg">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <DialogTitle className="text-5xl md:text-6xl font-black bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent mb-4">
                  Modo Eventos
                </DialogTitle>

                {/* Subtitle */}
                <div className="flex items-center justify-center gap-4 text-white/90 mb-4">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-orange-500"></div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-bold tracking-wider uppercase">Sistema de Personalização</span>
                    <Palette className="h-4 w-4 text-orange-400" />
                  </div>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-orange-500"></div>
                </div>

                <p className="text-white/70 text-lg max-w-3xl mx-auto">
                  Transforme sua experiência de estudos com temas sazonais e efeitos visuais imersivos
                </p>
              </DialogHeader>

              {/* Status Indicators */}
              <div className="flex items-center justify-center gap-8 mt-8">
                <div className="flex items-center gap-2 text-white/80">
                  <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Dinâmico</div>
                    <div className="text-xs opacity-70">Tempo Real</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Imersivo</div>
                    <div className="text-xs opacity-70">Multi-sensorial</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Interativo</div>
                    <div className="text-xs opacity-70">Gamificado</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Modes Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {eventModes.map((mode, index) => (
                  <div
                    key={mode.id}
                    className={`relative group cursor-pointer transition-all duration-500 hover:scale-105 ${
                      mode.isActive ? 'scale-105' : ''
                    }`}
                    onClick={() => toggleEventMode(mode.id)}
                  >
                    {/* Card Container */}
                    <div
                      className={`relative p-6 rounded-2xl border-2 transition-all duration-500 backdrop-blur-xl shadow-xl ${
                        mode.isActive
                          ? 'border-orange-500 bg-gradient-to-br from-black/40 to-transparent'
                          : 'border-white/20 bg-gradient-to-br from-white/10 to-transparent hover:border-white/40'
                      }`}
                      style={{
                        boxShadow: mode.isActive
                          ? `0 0 30px ${mode.color}40, 0 0 60px ${mode.color}20`
                          : undefined
                      }}
                    >
                      {/* Active Indicator */}
                      {mode.isActive && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: mode.color }}
                          >
                            <Check className="h-4 w-4 text-white font-bold" />
                          </div>
                        </div>
                      )}

                      {/* Icon Section */}
                      <div className="flex items-center justify-center mb-4">
                        <div
                          className={`p-4 rounded-xl transition-all duration-500 ${
                            mode.isActive
                              ? 'bg-gradient-to-br from-white/20 to-white/10 scale-110'
                              : 'bg-gradient-to-br from-white/10 to-white/5 group-hover:scale-110'
                          }`}
                          style={{
                            color: mode.isActive ? mode.color : '#ffffff'
                          }}
                        >
                          {mode.icon}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-center space-y-3">
                        <h3 className="text-xl font-bold text-white">
                          {mode.name}
                        </h3>

                        <p className="text-white/70 text-sm">
                          {mode.description}
                        </p>

                        {/* Features */}
                        <div className="space-y-1">
                          {mode.features.map((feature, featureIndex) => (
                            <div
                              key={featureIndex}
                              className="flex items-center gap-2 text-xs text-white/60"
                            >
                              <div
                                className="w-1 h-1 rounded-full"
                                style={{ backgroundColor: mode.accentColor }}
                              ></div>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* Switch */}
                        <div className="pt-4 flex items-center justify-center">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white/80">
                              {mode.isActive ? 'Ativado' : 'Desativado'}
                            </span>
                            <Switch
                              checked={mode.isActive}
                              className="data-[state=checked]:bg-orange-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Mode Status */}
              {activeMode && (
                <div className="mt-8 flex items-center justify-center">
                  <div className="bg-gradient-to-r from-black/40 to-black/20 backdrop-blur-xl border border-white/20 rounded-xl px-6 py-3 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-white font-semibold">Modo Ativo:</span>
                    </div>
                    <Badge
                      className="text-white font-bold px-3 py-1"
                      style={{
                        backgroundColor: eventModes.find(mode => mode.id === activeMode)?.color || '#FF6B00'
                      }}
                    >
                      {eventModes.find(mode => mode.id === activeMode)?.name}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
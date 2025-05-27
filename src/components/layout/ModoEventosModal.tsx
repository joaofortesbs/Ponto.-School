
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
  Volume2,
  Check,
  Play,
  Pause,
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
      <DialogContent className="sm:max-w-7xl max-w-[95vw] h-[90vh] p-0 border-0 bg-transparent overflow-hidden">
        <div className="relative w-full h-full">
          {/* Ultra Modern Background with Advanced Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#1A1A2E] to-[#16213E] rounded-3xl border border-[#FF6B00]/30 shadow-2xl backdrop-blur-3xl">
            {/* Animated Neural Network Background */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              {/* Dynamic Grid Lines */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#FF6B00]/20 to-transparent animate-pulse"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#FF8C40]/20 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              
              {/* Floating Particles */}
              <div className="absolute top-20 left-20 w-3 h-3 bg-[#FF6B00] rounded-full animate-bounce opacity-60" style={{ animationDelay: '0s' }}></div>
              <div className="absolute top-32 right-24 w-2 h-2 bg-[#FF8C40] rounded-full animate-ping opacity-40" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-24 left-32 w-2.5 h-2.5 bg-[#FFD700] rounded-full animate-pulse opacity-50" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-40 right-20 w-2 h-2 bg-[#FF6B00] rounded-full animate-ping opacity-30" style={{ animationDelay: '1.5s' }}></div>
              <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 bg-[#FF8C40] rounded-full animate-pulse opacity-40" style={{ animationDelay: '2s' }}></div>
              <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-[#FFD700] rounded-full animate-ping opacity-35" style={{ animationDelay: '2.5s' }}></div>
            </div>

            {/* Advanced Glow Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B00]/10 via-transparent to-[#FF8C40]/10 rounded-3xl"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[500px] h-[500px] bg-[#FF6B00]/15 rounded-full blur-3xl opacity-40 animate-pulse"></div>
            <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-[#FF8C40]/10 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Ultra Modern Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-6 right-6 z-50 h-12 w-12 rounded-2xl bg-black/30 hover:bg-black/50 border border-white/20 text-white hover:text-[#FF6B00] transition-all duration-500 group backdrop-blur-md"
          >
            <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" />
          </Button>

          {/* Main Content Container */}
          <div className="relative z-10 h-full flex flex-col">
            {/* Ultra Sophisticated Header */}
            <div className="px-10 pt-10 pb-8">
              <DialogHeader className="text-center space-y-8">
                {/* Advanced Icon Constellation */}
                <div className="flex items-center justify-center relative">
                  <div className="relative">
                    {/* Central Holographic Icon */}
                    <div className="relative bg-gradient-to-br from-[#FF6B00] via-[#FF8C40] to-[#FFD700] p-8 rounded-3xl shadow-2xl border border-[#FFD700]/40 backdrop-blur-md">
                      <Calendar className="h-12 w-12 text-white" />
                      <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/30 to-[#FF8C40]/30 rounded-3xl animate-pulse"></div>
                      
                      {/* Holographic Ring Effect */}
                      <div className="absolute -inset-2 border-2 border-[#FF6B00]/30 rounded-3xl animate-spin" style={{ animationDuration: '8s' }}></div>
                      <div className="absolute -inset-4 border border-[#FF8C40]/20 rounded-3xl animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}></div>
                    </div>

                    {/* Orbiting Elements with Advanced Animation */}
                    <div className="absolute -top-4 -right-4 bg-gradient-to-br from-[#FFD700] to-[#FF8C40] p-3 rounded-2xl animate-bounce shadow-lg">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-[#FF8C40] to-[#FF6B00] p-3 rounded-2xl animate-pulse shadow-lg">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -top-4 -left-4 bg-gradient-to-br from-[#FF6B00] to-[#FFD700] p-2 rounded-2xl animate-ping shadow-lg">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute -bottom-4 -right-4 bg-gradient-to-br from-[#FFD700] to-[#FF6B00] p-2 rounded-2xl animate-bounce shadow-lg" style={{ animationDelay: '0.5s' }}>
                      <Target className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Ultra Modern Title Section */}
                <div className="space-y-6">
                  {/* Main Title with Holographic Effect */}
                  <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-[#FF6B00] via-[#FF8C40] to-[#FFD700] bg-clip-text text-transparent leading-tight tracking-tight relative">
                    Modo Eventos
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B00]/20 via-[#FF8C40]/20 to-[#FFD700]/20 blur-xl animate-pulse"></div>
                  </h1>
                  
                  {/* Sophisticated Subtitle */}
                  <div className="flex items-center justify-center gap-4 text-white/90">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#FF6B00]"></div>
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-[#FF6B00] animate-spin" style={{ animationDuration: '3s' }} />
                      <span className="text-lg font-bold tracking-widest uppercase bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent">
                        Sistema Avançado de Personalização
                      </span>
                      <Palette className="h-5 w-5 text-[#FF8C40] animate-pulse" />
                    </div>
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#FF6B00]"></div>
                  </div>

                  {/* Enhanced Description */}
                  <p className="text-white/70 text-xl font-light max-w-4xl mx-auto leading-relaxed">
                    Transforme sua experiência de estudos com temas sazonais ultramodernos e efeitos visuais imersivos
                  </p>
                </div>
              </DialogHeader>

              {/* Advanced Status Indicators */}
              <div className="mt-10 flex items-center justify-center gap-12">
                <div className="flex items-center gap-3 text-white/80 group hover:text-[#FF6B00] transition-all duration-500">
                  <div className="p-3 rounded-2xl bg-white/10 group-hover:bg-[#FF6B00]/20 transition-all duration-500 backdrop-blur-md border border-white/20">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <span className="block text-lg font-bold">Dinâmico</span>
                    <span className="block text-sm opacity-70">Tempo Real</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/80 group hover:text-[#FF8C40] transition-all duration-500">
                  <div className="p-3 rounded-2xl bg-white/10 group-hover:bg-[#FF8C40]/20 transition-all duration-500 backdrop-blur-md border border-white/20">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <span className="block text-lg font-bold">Imersivo</span>
                    <span className="block text-sm opacity-70">Multi-sensorial</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/80 group hover:text-[#FFD700] transition-all duration-500">
                  <div className="p-3 rounded-2xl bg-white/10 group-hover:bg-[#FFD700]/20 transition-all duration-500 backdrop-blur-md border border-white/20">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <span className="block text-lg font-bold">Interativo</span>
                    <span className="block text-sm opacity-70">Gamificado</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ultra Sophisticated Event Modes Grid */}
            <div className="flex-1 px-10 pb-10 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {eventModes.map((mode, index) => (
                  <div
                    key={mode.id}
                    className={`relative group cursor-pointer transition-all duration-700 hover:scale-105 ${
                      mode.isActive ? 'scale-105' : ''
                    }`}
                    onClick={() => toggleEventMode(mode.id)}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    {/* Ultra Modern Card Container */}
                    <div
                      className={`relative p-8 rounded-3xl border-2 transition-all duration-700 backdrop-blur-2xl shadow-2xl ${
                        mode.isActive
                          ? `border-[${mode.color}] bg-gradient-to-br from-black/40 to-transparent shadow-[${mode.color}]/50`
                          : 'border-white/20 bg-gradient-to-br from-white/10 to-transparent hover:border-white/40'
                      }`}
                      style={{
                        background: mode.isActive
                          ? `linear-gradient(135deg, ${mode.color}20, transparent)`
                          : undefined,
                        boxShadow: mode.isActive
                          ? `0 0 40px ${mode.color}40, 0 0 80px ${mode.color}20`
                          : undefined
                      }}
                    >
                      {/* Advanced Activation Indicator */}
                      {mode.isActive && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-pulse"
                            style={{ backgroundColor: mode.color }}
                          >
                            <Check className="h-5 w-5 text-white font-bold" />
                          </div>
                          <div
                            className="absolute inset-0 rounded-full animate-ping"
                            style={{ backgroundColor: mode.color, opacity: 0.4 }}
                          ></div>
                        </div>
                      )}

                      {/* Holographic Icon Section */}
                      <div className="flex items-center justify-center mb-6">
                        <div
                          className={`relative p-6 rounded-2xl transition-all duration-700 ${
                            mode.isActive
                              ? 'bg-gradient-to-br from-white/20 to-white/10 scale-110'
                              : 'bg-gradient-to-br from-white/10 to-white/5 group-hover:scale-110'
                          }`}
                          style={{
                            background: mode.isActive
                              ? `linear-gradient(135deg, ${mode.gradientFrom}40, ${mode.gradientTo}40)`
                              : undefined
                          }}
                        >
                          <div
                            className="transition-all duration-700"
                            style={{ color: mode.isActive ? mode.color : '#ffffff' }}
                          >
                            {mode.icon}
                          </div>
                          
                          {/* Animated Ring Effect */}
                          {mode.isActive && (
                            <>
                              <div
                                className="absolute -inset-2 border-2 rounded-2xl animate-spin opacity-60"
                                style={{ 
                                  borderColor: mode.color,
                                  animationDuration: '6s'
                                }}
                              ></div>
                              <div
                                className="absolute -inset-4 border rounded-2xl animate-spin opacity-30"
                                style={{ 
                                  borderColor: mode.accentColor,
                                  animationDuration: '8s',
                                  animationDirection: 'reverse'
                                }}
                              ></div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Ultra Modern Text Content */}
                      <div className="text-center space-y-4">
                        <h3
                          className={`text-2xl font-bold transition-all duration-700 ${
                            mode.isActive
                              ? 'text-white'
                              : 'text-white/90 group-hover:text-white'
                          }`}
                        >
                          {mode.name}
                        </h3>
                        
                        <p className="text-white/70 text-sm leading-relaxed">
                          {mode.description}
                        </p>

                        {/* Features List with Modern Design */}
                        <div className="space-y-2 pt-4">
                          {mode.features.map((feature, featureIndex) => (
                            <div
                              key={featureIndex}
                              className="flex items-center gap-2 text-xs text-white/60"
                            >
                              <div
                                className="w-1.5 h-1.5 rounded-full animate-pulse"
                                style={{ backgroundColor: mode.accentColor }}
                              ></div>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* Advanced Activation Switch */}
                        <div className="pt-6 flex items-center justify-center">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-white/80">
                              {mode.isActive ? 'Ativado' : 'Desativado'}
                            </span>
                            <Switch
                              checked={mode.isActive}
                              className="data-[state=checked]:bg-gradient-to-r"
                              style={{
                                backgroundColor: mode.isActive ? mode.color : undefined
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Animated Background Effect */}
                      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                        <div
                          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ${
                            mode.isActive ? 'opacity-100' : ''
                          }`}
                          style={{
                            background: `linear-gradient(45deg, ${mode.gradientFrom}10, ${mode.gradientTo}10)`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Mode Status */}
              {activeMode && (
                <div className="mt-12 flex items-center justify-center">
                  <div className="bg-gradient-to-r from-black/40 to-black/20 backdrop-blur-xl border border-white/20 rounded-2xl px-8 py-4 flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#00FF00] rounded-full animate-pulse shadow-lg"></div>
                      <span className="text-white font-semibold">Modo Ativo:</span>
                    </div>
                    <Badge
                      className="text-white font-bold px-4 py-2 text-sm"
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

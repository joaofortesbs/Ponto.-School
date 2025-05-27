
import React from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModoEventosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModoEventosModal({
  isOpen,
  onClose,
}: ModoEventosModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-w-[95vw] h-[80vh] p-0 border-0 bg-transparent overflow-hidden">
        <div className="relative w-full h-full">
          {/* Background with gradient and effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A2540] via-[#001F3F] to-[#000B1A] rounded-2xl border border-[#FF6B00]/20 shadow-2xl backdrop-blur-xl">
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute top-10 left-10 w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse opacity-60"></div>
              <div className="absolute top-20 right-16 w-1 h-1 bg-[#FF8C40] rounded-full animate-ping opacity-40"></div>
              <div className="absolute bottom-16 left-20 w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-pulse opacity-50"></div>
              <div className="absolute bottom-32 right-12 w-1 h-1 bg-[#FF6B00] rounded-full animate-ping opacity-30"></div>
              <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-[#FF8C40] rounded-full animate-pulse opacity-40"></div>
              <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-ping opacity-35"></div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B00]/5 via-transparent to-[#FF8C40]/5 rounded-2xl"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl opacity-30"></div>
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 text-white hover:text-[#FF6B00] transition-all duration-300 group"
          >
            <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          </Button>

          {/* Main content */}
          <div className="relative z-10 h-full flex flex-col">
            {/* Header section */}
            <div className="px-8 pt-8 pb-6">
              <DialogHeader className="text-center space-y-6">
                {/* Icon constellation */}
                <div className="flex items-center justify-center relative">
                  <div className="relative">
                    {/* Central icon */}
                    <div className="relative bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] p-6 rounded-2xl shadow-2xl border border-[#FFD700]/30">
                      <Calendar className="h-8 w-8 text-white" />
                      <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/20 to-[#FF8C40]/20 rounded-2xl animate-pulse"></div>
                    </div>

                    {/* Orbiting icons */}
                    <div className="absolute -top-3 -right-3 bg-gradient-to-br from-[#FFD700] to-[#FF8C40] p-2 rounded-lg animate-bounce">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="absolute -bottom-3 -left-3 bg-gradient-to-br from-[#FF8C40] to-[#FF6B00] p-2 rounded-lg animate-pulse">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div className="absolute -top-3 -left-3 bg-gradient-to-br from-[#FF6B00] to-[#FFD700] p-1.5 rounded-lg animate-ping">
                      <Star className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>

                {/* Title with advanced styling */}
                <DialogTitle className="text-center">
                  <div className="space-y-3">
                    {/* Main title */}
                    <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#FF6B00] via-[#FF8C40] to-[#FFD700] bg-clip-text text-transparent leading-tight tracking-tight">
                      Modo Eventos
                    </h1>
                    
                    
                  </div>
                </DialogTitle>
              </DialogHeader>

              
            </div>

            {/* Content area - Event modes */}
            <div className="flex-1 px-8 pb-8">
              <div className="h-full">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Ativar Modos de Eventos</h3>
                  <p className="text-white/60">
                    Selecione os modos de eventos que deseja ativar para personalizar sua experiência
                  </p>
                </div>

                {/* Event modes grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {/* Carnaval */}
                  <div className="group relative bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-white/10 hover:border-[#FF6B00]/50 transition-all duration-300 hover:bg-white/15">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#FF1493] to-[#FFD700] rounded-xl flex items-center justify-center">
                          <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">Carnaval</h4>
                          <p className="text-white/60 text-sm">Modo festivo e colorido</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B00]"></div>
                      </label>
                    </div>
                  </div>

                  {/* Festa Junina */}
                  <div className="group relative bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-white/10 hover:border-[#FF6B00]/50 transition-all duration-300 hover:bg-white/15">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#8B4513] to-[#FFD700] rounded-xl flex items-center justify-center">
                          <Star className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">Festa Junina</h4>
                          <p className="text-white/60 text-sm">Temática rural e tradicional</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B00]"></div>
                      </label>
                    </div>
                  </div>

                  {/* Férias */}
                  <div className="group relative bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-white/10 hover:border-[#FF6B00]/50 transition-all duration-300 hover:bg-white/15">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#00CED1] to-[#FFD700] rounded-xl flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">Férias</h4>
                          <p className="text-white/60 text-sm">Modo relaxante e descontraído</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B00]"></div>
                      </label>
                    </div>
                  </div>

                  {/* Halloween */}
                  <div className="group relative bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-white/10 hover:border-[#FF6B00]/50 transition-all duration-300 hover:bg-white/15">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#800080] to-[#FF4500] rounded-xl flex items-center justify-center">
                          <Zap className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">Halloween</h4>
                          <p className="text-white/60 text-sm">Modo misterioso e divertido</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B00]"></div>
                      </label>
                    </div>
                  </div>

                  {/* Natal */}
                  <div className="group relative bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-white/10 hover:border-[#FF6B00]/50 transition-all duration-300 hover:bg-white/15">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#DC143C] to-[#228B22] rounded-xl flex items-center justify-center">
                          <Star className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">Natal</h4>
                          <p className="text-white/60 text-sm">Modo natalino e acolhedor</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B00]"></div>
                      </label>
                    </div>
                  </div>

                  {/* Final de Ano */}
                  <div className="group relative bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-white/10 hover:border-[#FF6B00]/50 transition-all duration-300 hover:bg-white/15">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#FF6B00] rounded-xl flex items-center justify-center">
                          <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">Final de Ano</h4>
                          <p className="text-white/60 text-sm">Modo celebrativo e reflexivo</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B00]"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="px-8 py-3 bg-transparent border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="px-8 py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white hover:from-[#FF8C40] hover:to-[#FFD700] border-0 transition-all duration-300 shadow-lg hover:shadow-[#FF6B00]/25"
                  >
                    Aplicar Configurações
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

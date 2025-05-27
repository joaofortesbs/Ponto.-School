
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Palette,
  Music,
  Sun,
  Ghost,
  Snowflake,
  Fireworks,
  Sparkles,
  Check,
  X,
} from "lucide-react";

interface ModoEventosModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EventMode {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  gradient: string;
  isActive: boolean;
}

const ModoEventosModal: React.FC<ModoEventosModalProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const [eventModes, setEventModes] = useState<EventMode[]>([
    {
      id: "carnaval",
      name: "Carnaval",
      icon: <Palette className="h-8 w-8" />,
      description: "Cores vibrantes e energia festiva",
      colors: {
        primary: "#FF6B35",
        secondary: "#F7931E",
        accent: "#FFD23F",
      },
      gradient: "from-orange-500 via-yellow-500 to-red-500",
      isActive: false,
    },
    {
      id: "festa-junina",
      name: "Festa Junina",
      icon: <Music className="h-8 w-8" />,
      description: "Ambiente caipira e acolhedor",
      colors: {
        primary: "#8B4513",
        secondary: "#DAA520",
        accent: "#CD853F",
      },
      gradient: "from-yellow-600 via-orange-600 to-red-600",
      isActive: false,
    },
    {
      id: "ferias",
      name: "Férias",
      icon: <Sun className="h-8 w-8" />,
      description: "Relaxamento e diversão",
      colors: {
        primary: "#00BFFF",
        secondary: "#87CEEB",
        accent: "#FFD700",
      },
      gradient: "from-blue-400 via-cyan-400 to-yellow-400",
      isActive: false,
    },
    {
      id: "halloween",
      name: "Halloween",
      icon: <Ghost className="h-8 w-8" />,
      description: "Mistério e diversão assombrada",
      colors: {
        primary: "#FF4500",
        secondary: "#8B008B",
        accent: "#000000",
      },
      gradient: "from-purple-900 via-orange-600 to-black",
      isActive: false,
    },
    {
      id: "natal",
      name: "Natal",
      icon: <Snowflake className="h-8 w-8" />,
      description: "Magia natalina e união",
      colors: {
        primary: "#DC143C",
        secondary: "#228B22",
        accent: "#FFD700",
      },
      gradient: "from-red-600 via-green-600 to-yellow-500",
      isActive: false,
    },
    {
      id: "final-de-ano",
      name: "Final de Ano",
      icon: <Fireworks className="h-8 w-8" />,
      description: "Celebração e novos começos",
      colors: {
        primary: "#4169E1",
        secondary: "#FF1493",
        accent: "#FFD700",
      },
      gradient: "from-blue-600 via-purple-600 to-pink-600",
      isActive: false,
    },
  ]);

  const [activeMode, setActiveMode] = useState<string | null>(null);

  const handleActivateMode = (modeId: string) => {
    setEventModes((prev) =>
      prev.map((mode) => ({
        ...mode,
        isActive: mode.id === modeId,
      }))
    );
    setActiveMode(modeId);

    // Aplicar tema ao localStorage
    const selectedMode = eventModes.find((mode) => mode.id === modeId);
    if (selectedMode) {
      localStorage.setItem("eventMode", JSON.stringify(selectedMode));
      
      // Dispatch evento para atualizar toda a plataforma
      window.dispatchEvent(
        new CustomEvent("eventModeChanged", {
          detail: selectedMode,
        })
      );
    }
  };

  const handleDeactivateMode = () => {
    setEventModes((prev) =>
      prev.map((mode) => ({
        ...mode,
        isActive: false,
      }))
    );
    setActiveMode(null);
    localStorage.removeItem("eventMode");
    
    window.dispatchEvent(
      new CustomEvent("eventModeChanged", {
        detail: null,
      })
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-[#0A2540]/95 border border-[#FF6B00]/30 shadow-2xl">
        <DialogHeader className="pb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-full blur-lg opacity-70"></div>
              <div className="relative bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-full p-3">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </motion.div>
          </div>
          <DialogTitle className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#FF6B00] via-[#FF8C40] to-[#FFD700] bg-clip-text text-transparent">
                Modo Eventos
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                Transforme sua experiência com temas festivos especiais
              </p>
            </motion.div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status atual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600"></div>
              <span className="font-medium text-gray-700 dark:text-gray-200">
                Status Atual:
              </span>
              {activeMode ? (
                <Badge className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white">
                  {eventModes.find((mode) => mode.id === activeMode)?.name} Ativo
                </Badge>
              ) : (
                <Badge variant="outline">Nenhum tema ativo</Badge>
              )}
            </div>
            {activeMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeactivateMode}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                <X className="h-4 w-4 mr-1" />
                Desativar
              </Button>
            )}
          </motion.div>

          {/* Grid de modos de eventos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
            <AnimatePresence>
              {eventModes.map((mode, index) => (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  className={`relative group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
                    mode.isActive
                      ? "ring-2 ring-[#FF6B00] ring-offset-2 dark:ring-offset-gray-800"
                      : ""
                  }`}
                  onClick={() => handleActivateMode(mode.id)}
                >
                  {/* Background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
                  ></div>

                  {/* Card content */}
                  <div className="relative p-6 bg-white/80 dark:bg-[#0A2540]/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 rounded-full bg-gradient-to-br ${mode.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        {mode.icon}
                      </div>
                      {mode.isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-green-500 text-white rounded-full p-1"
                        >
                          <Check className="h-4 w-4" />
                        </motion.div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                        {mode.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {mode.description}
                      </p>

                      {/* Color preview */}
                      <div className="flex gap-2 mb-4">
                        <div
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: mode.colors.primary }}
                        ></div>
                        <div
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: mode.colors.secondary }}
                        ></div>
                        <div
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: mode.colors.accent }}
                        ></div>
                      </div>
                    </div>

                    {/* Action button */}
                    <Button
                      className={`w-full transition-all duration-300 ${
                        mode.isActive
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : `bg-gradient-to-r ${mode.gradient} text-white hover:opacity-90`
                      }`}
                      size="sm"
                    >
                      {mode.isActive ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Ativo
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Ativar Tema
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Footer info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
          >
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Dica:</strong> Os temas aplicam cores e elementos visuais especiais em toda a plataforma!
            </p>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModoEventosModal;

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, X, Sparkles, Route, Rocket } from "lucide-react";

interface MentorAIRecommendationProps {
  onClose: () => void;
  onStartJourney: () => void;
}

const MentorAIRecommendation: React.FC<MentorAIRecommendationProps> = ({
  onClose,
  onStartJourney,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simulate delay for the notification to appear
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 max-w-sm w-full bg-[#001427] border border-[#FF6B00]/30 rounded-xl shadow-xl overflow-hidden z-50"
        >
          <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white">Mentor IA</h3>
            </div>
            <Badge className="bg-white/20 text-white hover:bg-white/30 transition-colors">
              Recomendação
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-white/80 hover:text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
                <Route className="h-5 w-5 text-[#FF6B00]" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">
                  Jornada do Conhecimento
                </h4>
                <p className="text-sm text-gray-300">
                  Baseado no seu perfil de aprendizado, recomendo iniciar a
                  Jornada do Conhecimento para desenvolver habilidades
                  essenciais de estudo.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-[#FF6B00] hover:text-[#FF8C40] hover:bg-[#FF6B00]/10"
                onClick={onClose}
              >
                Mais tarde
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                onClick={onStartJourney}
              >
                <Sparkles className="h-4 w-4 mr-1" /> Explorar Jornada
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MentorAIRecommendation;

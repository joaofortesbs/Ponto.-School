import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, ChevronRight, X } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onStartTour,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      // In a real app, save this preference to localStorage or user settings
      localStorage.setItem("hideMinhasTurmasOnboarding", "true");
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white font-montserrat">
                  Bem-vindo às Suas Turmas!
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-white/80 hover:text-white hover:bg-white/20"
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-6 font-open-sans">
                Aqui você encontra todas as suas turmas, materiais, atividades e
                muito mais! Vamos fazer um tour rápido para você conhecer todas
                as funcionalidades.
              </p>

              <div className="flex items-center gap-2 mb-6">
                <Checkbox
                  id="dont-show-again"
                  checked={dontShowAgain}
                  onCheckedChange={(checked) => setDontShowAgain(!!checked)}
                  className="border-[#FF6B00]/50 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:text-white"
                />
                <label
                  htmlFor="dont-show-again"
                  className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                >
                  Não mostrar novamente
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                  onClick={handleClose}
                >
                  Pular
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                  onClick={() => {
                    handleClose();
                    onStartTour();
                  }}
                >
                  Começar Tour <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingModal;

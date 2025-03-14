import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, X } from "lucide-react";

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: "top" | "right" | "bottom" | "left";
}

interface TourGuideProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const TourGuide: React.FC<TourGuideProps> = ({
  isActive,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<DOMRect | null>(null);

  const tourSteps: TourStep[] = [
    {
      target: ".turmas-header",
      title: "Cabeçalho de Turmas",
      content:
        "Esta é a seção principal que mostra o título 'Minhas Turmas' e informações sobre quantas turmas ativas você possui.",
      position: "bottom",
    },
    {
      target: ".turmas-tabs",
      title: "Categorias de Turmas",
      content:
        "Aqui você pode alternar entre diferentes visualizações: Todas as turmas, Turmas Oficiais, Minhas Turmas, Grupos de Estudo e Desempenho.",
      position: "bottom",
    },
    {
      target: ".turmas-filters",
      title: "Filtros de Turmas",
      content:
        "Use estes filtros para encontrar turmas específicas por professor, disciplina, favoritos ou progresso.",
      position: "bottom",
    },
    {
      target: ".turmas-grid",
      title: "Lista de Turmas",
      content:
        "Aqui você encontra todas as turmas em que está inscrito. Cada card mostra informações importantes como progresso, próxima aula e status.",
      position: "bottom",
    },
    {
      target: ".turma-card",
      title: "Card da Turma",
      content:
        "Clique em um card para acessar os materiais, atividades e fórum da turma. Você pode ver seu progresso, próximas aulas e tarefas pendentes.",
      position: "right",
    },
    {
      target: ".favorite-star",
      title: "Favoritar Turma",
      content:
        "Clique na estrela para adicionar ou remover uma turma dos seus favoritos. Turmas favoritas podem ser filtradas facilmente.",
      position: "left",
    },
    {
      target: ".notification-indicator",
      title: "Indicadores de Notificação",
      content:
        "Estes ícones mostram quantas notificações você tem para mensagens, tarefas e materiais em cada turma.",
      position: "top",
    },
    {
      target: ".turma-search",
      title: "Busca de Turmas",
      content:
        "Use a busca para encontrar rapidamente uma turma específica por nome, professor ou disciplina.",
      position: "bottom",
    },
    {
      target: ".add-turma-button",
      title: "Adicionar Turma",
      content:
        "Clique aqui para adicionar uma nova turma ao seu painel de estudos usando um código de acesso ou buscando turmas disponíveis.",
      position: "left",
    },
    {
      target: ".epictus-ia-helper",
      title: "Assistente Epictus IA",
      content:
        "Este assistente inteligente pode ajudar com dúvidas sobre suas turmas, recomendar materiais de estudo e dar dicas personalizadas.",
      position: "left",
    },
    {
      target: ".sidebar-turmas-nav",
      title: "Navegação de Turmas no Menu Lateral",
      content:
        "Acesse rapidamente suas turmas através deste menu lateral. Veja notificações e navegue entre diferentes categorias de turmas.",
      position: "right",
    },
    {
      target: ".clear-notifications",
      title: "Limpar Notificações",
      content:
        "Clique aqui para limpar todas as notificações de uma categoria específica de turmas.",
      position: "right",
    },
  ];

  useEffect(() => {
    if (isActive && tourSteps[currentStep]) {
      const targetSelector = tourSteps[currentStep].target;
      const element = document.querySelector(targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetElement(rect);

        // Add highlight to the element
        element.classList.add("tour-highlight");

        return () => {
          // Remove highlight when step changes
          element.classList.remove("tour-highlight");
        };
      }
    }
  }, [isActive, currentStep, tourSteps]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const getTooltipPosition = () => {
    if (!targetElement) return { top: "50%", left: "50%" };

    const position = tourSteps[currentStep].position;
    const margin = 20; // margin from the target element

    switch (position) {
      case "top":
        return {
          bottom: `${window.innerHeight - targetElement.top + margin}px`,
          left: `${targetElement.left + targetElement.width / 2}px`,
          transform: "translateX(-50%)",
        };
      case "right":
        return {
          top: `${targetElement.top + targetElement.height / 2}px`,
          left: `${targetElement.right + margin}px`,
          transform: "translateY(-50%)",
        };
      case "bottom":
        return {
          top: `${targetElement.bottom + margin}px`,
          left: `${targetElement.left + targetElement.width / 2}px`,
          transform: "translateX(-50%)",
        };
      case "left":
        return {
          top: `${targetElement.top + targetElement.height / 2}px`,
          right: `${window.innerWidth - targetElement.left + margin}px`,
          transform: "translateY(-50%)",
        };
      default:
        return { top: "50%", left: "50%" };
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Target element highlight */}
      {targetElement && (
        <div
          className="absolute border-2 border-[#FF6B00] rounded-lg pointer-events-none"
          style={{
            top: targetElement.top - 4 + "px",
            left: targetElement.left - 4 + "px",
            width: targetElement.width + 8 + "px",
            height: targetElement.height + 8 + "px",
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
          }}
        />
      )}

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute bg-white dark:bg-[#1E293B] rounded-xl shadow-xl p-4 max-w-xs pointer-events-auto"
          style={getTooltipPosition()}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-900 dark:text-white">
              {tourSteps[currentStep].title}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={onSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {tourSteps[currentStep].content}
          </p>
          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentStep ? "bg-[#FF6B00]" : "bg-gray-300 dark:bg-gray-600"}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                onClick={onSkip}
              >
                Pular
              </Button>
              <Button
                size="sm"
                className="text-xs h-8 bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
                onClick={handleNext}
              >
                {currentStep < tourSteps.length - 1 ? (
                  <>
                    Próximo <ChevronRight className="h-3 w-3 ml-1" />
                  </>
                ) : (
                  "Concluir"
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TourGuide;


import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";

interface Slide {
  titulo: string;
  topicos: string[];
  explicacao: string;
  imagemOpcional?: string;
}

interface SlidesPresentationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slides: Slide[];
}

const SlidesPresentationModal: React.FC<SlidesPresentationModalProps> = ({
  open,
  onOpenChange,
  slides
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Efeito para controlar estado de carregamento
  useEffect(() => {
    // Se há slides válidos, considere como carregado após um pequeno delay
    if (Array.isArray(slides) && slides.length > 0) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800); // Pequeno delay para mostrar o loading
      return () => clearTimeout(timer);
    } else {
      setIsLoading(true);
    }
  }, [slides]);

  // Verificar se temos slides válidos
  const validSlides = Array.isArray(slides) && slides.length > 0 ? slides : [
    {
      titulo: "Não foi possível gerar a apresentação",
      topicos: ["Conteúdo insuficiente para criar slides"],
      explicacao: "Não foi possível gerar slides com o conteúdo fornecido. Por favor, tente novamente com um conteúdo mais extenso ou entre em contato com o suporte.",
      imagemOpcional: ""
    }
  ];

  const goToNextSlide = () => {
    if (currentSlideIndex < validSlides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const currentSlide = validSlides[currentSlideIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full p-0 overflow-hidden bg-white dark:bg-gray-800 rounded-lg">
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white flex justify-between items-center">
            <h2 className="text-xl font-bold">{currentSlide?.titulo || "Apresentação"}</h2>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/20">
              <X size={24} />
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex-grow p-6 overflow-y-auto max-h-[60vh]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-center">Gerando slides, por favor aguarde...</p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-6 animate-fadeIn transition-all duration-300">
                {/* Main content */}
                <div className={`flex-1 ${currentSlide?.imagemOpcional ? 'md:w-1/2' : 'w-full'}`}>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">{currentSlide?.titulo}</h3>
                  
                  {currentSlide?.topicos && currentSlide.topicos.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Principais tópicos:</h4>
                      <ul className="space-y-1">
                        {currentSlide.topicos.map((topico, index) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-block h-2 w-2 rounded-full bg-orange-500 mt-1.5 mr-2"></span>
                            <span className="text-gray-700 dark:text-gray-300">{topico}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mt-4 overflow-y-auto">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Explicação:</h4>
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{currentSlide?.explicacao}</div>
                  </div>
                </div>
                
                {/* Image (if available) */}
                {currentSlide?.imagemOpcional && (
                  <div className="md:w-1/2 flex items-center justify-center">
                    <img 
                      src={currentSlide.imagemOpcional}
                      alt={`Ilustração para ${currentSlide.titulo}`}
                      className="max-w-full max-h-64 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer with navigation */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
            <Button
              variant="outline"
              onClick={goToPreviousSlide}
              disabled={currentSlideIndex === 0}
              className="flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              Anterior
            </Button>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Slide {currentSlideIndex + 1} de {validSlides.length}
            </div>
            
            <Button
              variant="default"
              onClick={goToNextSlide}
              disabled={currentSlideIndex === validSlides.length - 1}
              className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1"
            >
              Próximo
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SlidesPresentationModal;

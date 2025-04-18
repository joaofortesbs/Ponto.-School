
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Sparkles, PresentationScreen } from "lucide-react";

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
  isLoading?: boolean;
}

const SlidesPresentationModal: React.FC<SlidesPresentationModalProps> = ({
  open,
  onOpenChange,
  slides,
  isLoading = false
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [processingSlides, setProcessingSlides] = useState(true);
  const [validSlides, setValidSlides] = useState<Slide[]>([]);

  // Processar slides quando disponíveis
  useEffect(() => {
    console.log("SlidesPresentationModal: Processando slides", { isLoading, slidesLength: slides?.length });
    
    // Verificar se temos slides válidos
    if (isLoading) {
      setProcessingSlides(true);
      return;
    }
    
    if (Array.isArray(slides) && slides.length > 0) {
      console.log("SlidesPresentationModal: Slides válidos encontrados", slides);
      setValidSlides(slides);
      setProcessingSlides(false);
      // Garantir que o índice atual seja válido
      setCurrentSlideIndex(0);
    } else {
      console.log("SlidesPresentationModal: Usando slides de fallback");
      // Slides de fallback
      setValidSlides([
        {
          titulo: "Não foi possível gerar a apresentação",
          topicos: ["Conteúdo insuficiente para criar slides"],
          explicacao: "Não foi possível gerar slides com o conteúdo fornecido. Por favor, tente novamente com um conteúdo mais extenso ou entre em contato com o suporte.",
          imagemOpcional: ""
        }
      ]);
      setProcessingSlides(false);
    }
  }, [slides, isLoading]);

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

  const currentSlide = validSlides[currentSlideIndex] || {
    titulo: "Preparando apresentação...",
    topicos: [],
    explicacao: "Aguarde enquanto geramos o conteúdo."
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full p-0 overflow-hidden bg-white dark:bg-gray-800 rounded-lg">
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              {processingSlides || isLoading ? (
                <>
                  <div className="animate-pulse">Gerando apresentação</div>
                  <div className="flex space-x-1 ml-2">
                    <div className="h-2 w-2 rounded-full bg-white animate-bounce"></div>
                    <div className="h-2 w-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="h-2 w-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </>
              ) : (
                currentSlide?.titulo || "Apresentação"
              )}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/20">
              <X size={24} />
            </Button>
          </div>
          
          {/* Content */}
          {processingSlides || isLoading ? (
            <div className="flex-grow flex flex-col items-center justify-center p-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PresentationScreen className="h-10 w-10 text-orange-500" />
                </div>
                <div className="relative w-12 h-12 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700 opacity-25"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Preparando apresentação</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  A IA está trabalhando para gerar uma apresentação completa sobre este tema. Isso pode levar alguns instantes...
                </p>
                <div className="mt-8 flex items-center justify-center gap-2 text-sm text-orange-500 dark:text-orange-400">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span>Gerando slides com conteúdo inteligente</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow p-6 overflow-y-auto max-h-[60vh]">
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
            </div>
          )}
          
          {/* Footer with navigation */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
            <Button
              variant="outline"
              onClick={goToPreviousSlide}
              disabled={processingSlides || isLoading || currentSlideIndex === 0}
              className="flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              Anterior
            </Button>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {processingSlides || isLoading ? (
                <span className="animate-pulse">Preparando slides...</span>
              ) : (
                <>Slide {currentSlideIndex + 1} de {validSlides.length}</>
              )}
            </div>
            
            <Button
              variant="default"
              onClick={goToNextSlide}
              disabled={processingSlides || isLoading || currentSlideIndex === validSlides.length - 1}
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

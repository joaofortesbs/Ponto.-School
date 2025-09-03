
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RotateCcw, CheckCircle2, X, Play, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashCard {
  id: number;
  front: string;
  back: string;
  category?: string;
  difficulty?: string;
}

interface FlashCardsContent {
  title: string;
  description: string;
  cards: FlashCard[];
  totalCards: number;
  theme: string;
  subject: string;
  schoolYear: string;
  instructions: string;
  evaluation: string;
  generatedByAI: boolean;
  generatedAt: string;
  isFallback?: boolean;
}

interface FlashCardsPreviewProps {
  content: FlashCardsContent | null;
  isLoading?: boolean;
}

export const FlashCardsPreview: React.FC<FlashCardsPreviewProps> = ({ 
  content, 
  isLoading = false 
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());
  const [isStudyMode, setIsStudyMode] = useState(false);

  // Reset quando o conteúdo muda
  useEffect(() => {
    if (content?.cards) {
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setStudiedCards(new Set());
      setIsStudyMode(false);
    }
  }, [content]);

  console.log('🃏 FlashCardsPreview renderizando:', { content, isLoading });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF6B00] mb-4"></div>
        <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Gerando Flash Cards...
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          A IA está criando seus flash cards personalizados. Aguarde um momento.
        </p>
      </div>
    );
  }

  if (!content || !content.cards || content.cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <FileText className="h-16 w-16 text-gray-400 mb-4" />
        <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Nenhum Flash Card Disponível
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Preencha os campos de edição e clique em "Gerar Flash Cards com IA" para criar o conteúdo.
        </p>
      </div>
    );
  }

  const currentCard = content.cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / content.totalCards) * 100;

  const nextCard = () => {
    if (currentCardIndex < content.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const markAsStudied = () => {
    setStudiedCards(prev => new Set([...prev, currentCard.id]));
    nextCard();
  };

  const resetStudy = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudiedCards(new Set());
  };

  const toggleStudyMode = () => {
    setIsStudyMode(!isStudyMode);
    if (!isStudyMode) {
      resetStudy();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {content.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {content.description}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {content.isFallback && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Demonstração
              </Badge>
            )}
            <Badge variant="secondary">
              {content.totalCards} Cards
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progresso: {currentCardIndex + 1} de {content.totalCards}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between mt-4">
          <Button
            onClick={toggleStudyMode}
            variant={isStudyMode ? "default" : "outline"}
            className={isStudyMode ? "bg-[#FF6B00] hover:bg-[#FF8C40]" : ""}
          >
            <Play className="w-4 h-4 mr-2" />
            {isStudyMode ? 'Sair do Modo Estudo' : 'Iniciar Estudo'}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={resetStudy}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar
            </Button>
          </div>
        </div>
      </div>

      {/* Flash Card Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCardIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card 
                className="h-80 cursor-pointer transform transition-transform hover:scale-105 relative overflow-hidden"
                onClick={flipCard}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"></div>
                
                <CardHeader className="relative z-10 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {isFlipped ? 'Resposta' : 'Pergunta'} {currentCardIndex + 1}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {currentCard.category && (
                        <Badge variant="outline" className="text-xs">
                          {currentCard.category}
                        </Badge>
                      )}
                      {studiedCards.has(currentCard.id) && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 h-48 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isFlipped ? 'back' : 'front'}
                      initial={{ opacity: 0, rotateY: -180 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: 180 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                        {isFlipped ? currentCard.back : currentCard.front}
                      </p>
                      
                      {!isFlipped && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                          Clique para ver a resposta
                        </p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </CardContent>

                {/* Card Number Indicator */}
                <div className="absolute top-4 right-4 bg-[#FF6B00] text-white text-xs px-2 py-1 rounded-full">
                  {currentCardIndex + 1}/{content.totalCards}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation and Action Buttons */}
          <div className="flex items-center justify-between mt-6">
            <Button
              onClick={previousCard}
              disabled={currentCardIndex === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </Button>

            {isStudyMode && isFlipped && (
              <div className="flex gap-2">
                <Button
                  onClick={markAsStudied}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Entendi
                </Button>
                <Button
                  onClick={nextCard}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Revisar Depois
                </Button>
              </div>
            )}

            <Button
              onClick={nextCard}
              disabled={currentCardIndex === content.cards.length - 1}
              variant="outline"
              className="flex items-center gap-2"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <strong>Tema:</strong> {content.theme}
          </div>
          <div>
            <strong>Disciplina:</strong> {content.subject}
          </div>
          <div>
            <strong>Ano:</strong> {content.schoolYear}
          </div>
        </div>
        
        {studiedCards.size > 0 && (
          <div className="mt-2 text-sm text-green-600 dark:text-green-400">
            Cards estudados: {studiedCards.size} de {content.totalCards}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashCardsPreview;

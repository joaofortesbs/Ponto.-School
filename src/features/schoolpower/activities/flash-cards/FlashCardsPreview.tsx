
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw, Eye, FileText, CheckCircle2, Clock, Target, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashCardData {
  id: number;
  front: string;
  back: string;
  category?: string;
  difficulty?: 'Fácil' | 'Médio' | 'Difícil';
  tags?: string[];
}

interface FlashCardsPreviewProps {
  content: {
    title?: string;
    description?: string;
    flashCards?: FlashCardData[];
    totalFlashcards?: number;
    theme?: string;
    subject?: string;
    schoolYear?: string;
    difficulty?: string;
    objectives?: string;
    instructions?: string;
    evaluation?: string;
    generatedByAI?: boolean;
    isGeneratedByAI?: boolean;
    isFallback?: boolean;
  } | null;
  isLoading?: boolean;
}

export const FlashCardsPreview: React.FC<FlashCardsPreviewProps> = ({ 
  content, 
  isLoading = false 
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Reset when content changes
  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [content]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B00] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Gerando Flash Cards...</p>
        </div>
      </div>
    );
  }

  // No content state
  if (!content || !content.flashCards || content.flashCards.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Nenhum Flash Card Gerado
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Preencha os campos necessários e clique em "Gerar Flash Cards com IA" para criar o conteúdo.
          </p>
        </div>
      </div>
    );
  }

  const currentCard = content.flashCards[currentCardIndex];
  const hasMultipleCards = content.flashCards.length > 1;

  const goToNextCard = () => {
    if (currentCardIndex < content.flashCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const goToPreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const resetToFirst = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  // Overview mode
  if (showPreview) {
    return (
      <div className="w-full h-full overflow-y-auto bg-white dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {content.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {content.description}
              </p>
            </div>
            <Button
              onClick={() => setShowPreview(false)}
              variant="outline"
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              Modo Interativo
            </Button>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 text-[#FF6B00] mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {content.totalFlashcards}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Flash Cards</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {content.subject}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Disciplina</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {content.schoolYear}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Ano/Série</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {content.difficulty}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Dificuldade</div>
              </CardContent>
            </Card>
          </div>

          {/* Flash Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.flashCards.map((card, index) => (
              <Card key={card.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">Card {index + 1}</Badge>
                    {card.difficulty && (
                      <Badge variant={
                        card.difficulty === 'Fácil' ? 'default' :
                        card.difficulty === 'Médio' ? 'secondary' : 'destructive'
                      }>
                        {card.difficulty}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Frente:</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{card.front}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Verso:</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{card.back}</p>
                    </div>
                    {card.tags && card.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {card.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer Info */}
          {content.isGeneratedByAI && (
            <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-green-800 dark:text-green-200 text-sm">
                  Flash Cards gerados pela IA do Gemini
                </span>
              </div>
            </div>
          )}

          {content.isFallback && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                <span className="text-yellow-800 dark:text-yellow-200 text-sm">
                  Modo demonstração - Configure a API para gerar conteúdo personalizado
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Interactive mode
  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="p-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {content.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {content.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {currentCardIndex + 1} de {content.flashCards.length}
            </Badge>
            <Button
              onClick={() => setShowPreview(true)}
              variant="outline"
              size="sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Ver Todos
            </Button>
          </div>
        </div>
      </div>

      {/* Main Flash Card Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* Flash Card */}
          <motion.div
            key={`${currentCardIndex}-${isFlipped}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div 
              className="relative w-full h-80 cursor-pointer group perspective-1000"
              onClick={flipCard}
            >
              <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}>
                {/* Front of card */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center text-center">
                  <div className="mb-4">
                    <Badge variant="secondary" className="mb-2">Frente do Card</Badge>
                    {currentCard.category && (
                      <Badge variant="outline">{currentCard.category}</Badge>
                    )}
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-xl font-medium text-gray-900 dark:text-white leading-relaxed">
                      {currentCard.front}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Clique para virar
                  </p>
                </div>

                {/* Back of card */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] rounded-xl shadow-xl border border-orange-300 p-8 flex flex-col items-center justify-center text-center">
                  <div className="mb-4">
                    <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-white/30">
                      Verso do Card
                    </Badge>
                    {currentCard.difficulty && (
                      <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                        {currentCard.difficulty}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-lg text-white leading-relaxed">
                      {currentCard.back}
                    </p>
                  </div>
                  {currentCard.tags && currentCard.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-4">
                      {currentCard.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="bg-white/20 text-white border-white/30 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {hasMultipleCards && (
              <>
                <Button
                  onClick={goToPreviousCard}
                  disabled={currentCardIndex === 0}
                  variant="outline"
                  size="lg"
                  className="px-6"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  Anterior
                </Button>

                <Button
                  onClick={resetToFirst}
                  variant="outline"
                  size="lg"
                  className="px-6"
                  disabled={currentCardIndex === 0}
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Reiniciar
                </Button>

                <Button
                  onClick={goToNextCard}
                  disabled={currentCardIndex === content.flashCards.length - 1}
                  variant="outline"
                  size="lg"
                  className="px-6"
                >
                  Próximo
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </>
            )}
          </div>

          {/* Progress indicator */}
          {hasMultipleCards && (
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-2">
                {content.flashCards.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentCardIndex 
                        ? 'bg-[#FF6B00]' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>📚 {content.subject} • {content.schoolYear}</span>
            <span>🎯 {content.theme}</span>
            <span>📊 {content.difficulty}</span>
          </div>
          {content.isGeneratedByAI && (
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
              <span>Gerado por IA</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashCardsPreview;

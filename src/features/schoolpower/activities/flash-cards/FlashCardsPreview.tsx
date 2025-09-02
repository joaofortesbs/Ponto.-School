
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, AlertCircle, TrendingUp, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FlashCard {
  id: number;
  question: string;
  answer: string;
  category?: string;
}

interface FlashCardsContent {
  title: string;
  description: string;
  theme: string;
  topicos?: string;
  numberOfFlashcards?: number;
  context?: string;
  cards: FlashCard[];
  totalCards: number;
  isGeneratedByAI?: boolean;
  isFallback?: boolean;
  generatedAt?: string;
}

interface FlashCardsPreviewProps {
  content: FlashCardsContent;
  isLoading?: boolean;
}

interface CardResponse {
  cardId: number;
  response: 'almost' | 'correct';
}

const FlashCardsPreview: React.FC<FlashCardsPreviewProps> = ({ content, isLoading = false }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [responses, setResponses] = useState<CardResponse[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Debug logging DETALHADO para validar conteúdo recebido
  useEffect(() => {
    console.log('🃏 FlashCardsPreview recebeu content:', content);
    console.log('📊 Tipo do content:', typeof content);
    console.log('🔍 Content é null/undefined?', content === null || content === undefined);
    
    if (content) {
      console.log('📊 Estrutura COMPLETA do content:', {
        hasTitle: !!content.title,
        title: content.title,
        hasDescription: !!content.description,
        description: content.description,
        hasTheme: !!content.theme,
        theme: content.theme,
        hasTopicos: !!content.topicos,
        topicos: content.topicos,
        hasCards: !!content.cards,
        cardsType: typeof content.cards,
        cardsIsArray: Array.isArray(content.cards),
        cardsLength: content.cards?.length || 0,
        totalCards: content.totalCards,
        numberOfFlashcards: content.numberOfFlashcards,
        isGeneratedByAI: content.isGeneratedByAI,
        isFallback: content.isFallback,
        generatedAt: content.generatedAt,
        context: content.context
      });
      
      if (content.cards) {
        if (Array.isArray(content.cards)) {
          console.log('🃏 Array de cards detectado:', content.cards.length, 'cards');
          
          if (content.cards.length > 0) {
            console.log('🔍 Primeiro card COMPLETO:', content.cards[0]);
            console.log('🔍 Segundo card (se existir):', content.cards[1] || 'N/A');
            console.log('🔍 Último card:', content.cards[content.cards.length - 1]);
            
            console.log('🔍 Estrutura dos cards DETALHADA:', content.cards.map((card, index) => ({
              index,
              id: card?.id,
              hasQuestion: !!(card?.question),
              questionLength: card?.question?.length || 0,
              hasAnswer: !!(card?.answer),
              answerLength: card?.answer?.length || 0,
              category: card?.category,
              isValid: !!(card && card.question && card.answer)
            })));
            
            const validCardsCount = content.cards.filter(card => 
              card && card.question && card.answer
            ).length;
            
            console.log('📈 Cards válidos:', validCardsCount, 'de', content.cards.length);
          } else {
            console.warn('⚠️ Array de cards está vazio');
          }
        } else {
          console.error('❌ content.cards não é um array:', typeof content.cards);
        }
      } else {
        console.error('❌ content.cards é null/undefined');
      }
    } else {
      console.error('❌ Content é null/undefined');
    }
  }, [content]);

  // Reset quando o conteúdo mudar
  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowAnswer(false);
    setResponses([]);
    setIsCompleted(false);
  }, [content]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B00] mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Gerando Flash Cards...</p>
      </div>
    );
  }

  // VALIDAÇÃO ROBUSTA com debug detalhado
  const validationResult = {
    hasContent: !!content,
    hasCards: !!(content && content.cards),
    isCardsArray: !!(content && Array.isArray(content.cards)),
    cardsLength: content?.cards?.length || 0,
    hasValidCards: content?.cards && Array.isArray(content.cards) && 
                  content.cards.length > 0 && 
                  content.cards.some(card => card && card.question && card.answer)
  };

  console.log('🔍 VALIDAÇÃO ROBUSTA:', validationResult);

  if (!validationResult.hasContent || !validationResult.hasCards || !validationResult.isCardsArray || !validationResult.hasValidCards) {
    console.warn('⚠️ FlashCardsPreview: Falha na validação robusta', validationResult);
    
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
        <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Aguardando Flash Cards...
        </h4>
        <p className="text-gray-500 dark:text-gray-500">
          {!validationResult.hasContent ? 'Nenhum conteúdo recebido' :
           !validationResult.hasCards ? 'Aguardando dados dos cards' :
           !validationResult.isCardsArray ? 'Formato de dados inválido' :
           !validationResult.hasValidCards ? 'Cards sem perguntas válidas' :
           'Configure os campos e gere os flash cards'}
        </p>
        <div className="mt-4 text-xs text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
          Debug: {JSON.stringify(validationResult, null, 2)}
        </div>
        {content && (
          <div className="mt-2 text-xs text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded max-w-md">
            Content: {JSON.stringify({
              title: content.title,
              hasCards: !!content.cards,
              cardsType: typeof content.cards,
              cardsLength: content.cards?.length,
              firstCard: content.cards?.[0] ? {
                hasQuestion: !!content.cards[0].question,
                hasAnswer: !!content.cards[0].answer
              } : null
            }, null, 2)}
          </div>
        )}
      </div>
    );
  }

  const currentCard = content.cards[currentCardIndex];
  const progress = ((currentCardIndex + (showAnswer ? 1 : 0)) / content.totalCards) * 100;
  const completedCards = responses.length;

  const handleCardClick = () => {
    if (!showAnswer) {
      setIsFlipped(true);
      setTimeout(() => {
        setShowAnswer(true);
        setIsFlipped(false);
      }, 300);
    }
  };

  const handleResponse = (responseType: 'almost' | 'correct') => {
    const newResponse: CardResponse = {
      cardId: currentCard.id,
      response: responseType
    };

    setResponses(prev => [...prev, newResponse]);

    if (currentCardIndex < content.cards.length - 1) {
      // Próximo card
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
      setIsFlipped(false);
    } else {
      // Completou todos os cards
      setIsCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowAnswer(false);
    setResponses([]);
    setIsCompleted(false);
  };

  const correctAnswers = responses.filter(r => r.response === 'correct').length;
  const almostAnswers = responses.filter(r => r.response === 'almost').length;

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Parabéns! 🎉
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Você completou todos os {content.totalCards} flash cards!
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mb-6 w-full max-w-md">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-700">{correctAnswers}</p>
              <p className="text-sm text-green-600">Acertei em cheio!</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-700">{almostAnswers}</p>
              <p className="text-sm text-orange-600">Foi por pouco!</p>
            </CardContent>
          </Card>
        </div>

        <Button
          onClick={resetQuiz}
          className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reiniciar Flash Cards
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header com informações */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          {content.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {content.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {content.theme}
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            {currentCardIndex + 1} de {content.totalCards}
          </Badge>
          {content.isGeneratedByAI && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Gerado por IA
            </Badge>
          )}
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progresso
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Flash Card */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          className="w-full max-w-2xl"
          layout
        >
          <Card 
            className={`min-h-[300px] cursor-pointer transition-all duration-300 ${
              !showAnswer ? 'hover:shadow-lg border-2 border-[#FF6B00]/20 hover:border-[#FF6B00]/40' : ''
            }`}
            onClick={handleCardClick}
          >
            <CardContent className="p-8 h-full flex flex-col items-center justify-center text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={showAnswer ? 'answer' : 'question'}
                  initial={{ rotateY: isFlipped ? -90 : 0, opacity: isFlipped ? 0 : 1 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  {!showAnswer ? (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                        Pergunta {currentCard.id}
                      </h4>
                      <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                        {currentCard.question}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                        Clique no card para ver a resposta
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-lg font-semibold text-green-600 mb-4">
                        Resposta
                      </h4>
                      <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                        {currentCard.answer}
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Botões de Resposta */}
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex gap-4"
          >
            <Button
              onClick={() => handleResponse('almost')}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Essa foi por pouco!
            </Button>
            <Button
              onClick={() => handleResponse('correct')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Acertei em cheio!
            </Button>
          </motion.div>
        )}
      </div>

      {/* Contador de Cards Completados */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {completedCards} de {content.totalCards} cards completados
        </p>
      </div>
    </div>
  );
};

export default FlashCardsPreview;

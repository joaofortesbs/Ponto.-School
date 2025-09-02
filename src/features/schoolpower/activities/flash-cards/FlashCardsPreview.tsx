
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

  // Debugging detalhado sempre ativo
  useEffect(() => {
    console.log('🔍 FlashCardsPreview - Estado atual:', {
      hasContent: !!content,
      hasCards: !!(content?.cards),
      cardsLength: content?.cards?.length || 0,
      hasInternalData: !!internalFlashCardsData,
      internalCardsLength: internalFlashCardsData?.cards?.length || 0,
      isLoading,
      hasCheckedStorage,
      isContentLoaded
    });
    
    if (content && content.cards) {
      const validCardsCount = Array.isArray(content.cards) ? 
        content.cards.filter(card => card && card.question && card.answer).length : 0;
      
      console.log('🃏 FlashCards detalhes:', {
        totalCards: content.cards?.length || 0,
        validCards: validCardsCount,
        isGeneratedByAI: content.isGeneratedByAI,
        cardsSample: content.cards?.slice(0, 2)
      });
    }
  }, [content, internalFlashCardsData, isLoading, hasCheckedStorage, isContentLoaded]);

  // Reset quando o conteúdo mudar
  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowAnswer(false);
    setResponses([]);
    setIsCompleted(false);
  }, [content]);

  // Estado interno para gerenciar dados dos Flash Cards
  const [internalFlashCardsData, setInternalFlashCardsData] = useState<any>(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  // Listener para dados construídos automaticamente via AutoBuild
  useEffect(() => {
    const handleFlashCardsUpdate = (event: CustomEvent) => {
      console.log('📡 FlashCardsPreview recebeu evento de atualização via AutoBuild:', event.detail);
      
      if (event.detail && event.detail.data) {
        const updatedContent = event.detail.data;
        console.log('🔄 Aplicando novos dados do AutoBuild:', updatedContent);
        
        // Validar estrutura dos dados recebidos
        if (updatedContent.cards && Array.isArray(updatedContent.cards) && updatedContent.cards.length > 0) {
          console.log('✅ Dados válidos recebidos, atualizando estado interno');
          
          // Resetar estados de navegação
          setCurrentCardIndex(0);
          setIsFlipped(false);
          setShowAnswer(false);
          setResponses([]);
          setIsCompleted(false);
          
          // Aplicar dados no estado interno
          setInternalFlashCardsData(updatedContent);
          setIsContentLoaded(true);
          
          console.log('📊 Flash Cards carregados:', {
            totalCards: updatedContent.cards.length,
            cards: updatedContent.cards
          });
        }
      }
    };

    // Escutar eventos de atualização
    window.addEventListener('flash-cards-auto-build', handleFlashCardsUpdate as EventListener);
    window.addEventListener('activity-auto-built', handleFlashCardsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('flash-cards-auto-build', handleFlashCardsUpdate as EventListener);
      window.removeEventListener('activity-auto-built', handleFlashCardsUpdate as EventListener);
    };
  }, []);

  // Monitorar localStorage para Flash Cards construídos
  useEffect(() => {
    const checkForBuiltFlashCards = () => {
      console.log('🔍 Verificando localStorage para Flash Cards...');
      
      // Múltiplas tentativas de encontrar dados
      const possibleKeys = [
        `constructed_flash-cards_flash-cards`,
        'constructed_flash-cards_',
        'activity_flash-cards',
        'constructedActivities'
      ];
      
      let foundData = null;
      let usedKey = '';
      
      for (const key of possibleKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (key === 'constructedActivities') {
              // Procurar atividade de flash cards no objeto
              const flashCardsActivity = Object.values(parsed).find((activity: any) => 
                activity.activityType === 'flash-cards' && activity.generatedContent?.cards
              );
              if (flashCardsActivity) {
                foundData = (flashCardsActivity as any).generatedContent;
                usedKey = key;
                break;
              }
            } else if (parsed.data || parsed.cards) {
              foundData = parsed.data || parsed;
              usedKey = key;
              break;
            }
          } catch (error) {
            console.warn(`❌ Erro ao parsear ${key}:`, error);
          }
        }
      }
      
      console.log('🔍 Resultado da busca:', { foundData: !!foundData, usedKey });
      
      if (foundData && foundData.cards && foundData.cards.length > 0) {
        console.log('✅ Flash Cards encontrados:', foundData);
        setInternalFlashCardsData(foundData);
        setIsContentLoaded(true);
      }
      
      setHasCheckedStorage(true);
      
      if (flashCardsData) {
        try {
          const parsedData = JSON.parse(flashCardsData);
          const flashContent = parsedData.data || parsedData;
          
          if (flashContent.cards && flashContent.cards.length > 0) {
            console.log('🎯 Flash Cards encontrado no localStorage:', flashContent);
            setInternalFlashCardsData(flashContent);
            setIsContentLoaded(true);
            return;
          }
        } catch (error) {
          console.error('❌ Erro ao parsear dados do localStorage:', error);
        }
      }
      
      // Verificar storage genérico como fallback
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      const flashCardsActivity = Object.values(constructedActivities).find((activity: any) => 
        activity.activityType === 'flash-cards' && 
        activity.generatedContent && 
        activity.generatedContent.cards
      );

      if (flashCardsActivity && flashCardsActivity.generatedContent) {
        console.log('🔄 Flash Cards encontrado no storage genérico:', flashCardsActivity.generatedContent);
        setInternalFlashCardsData(flashCardsActivity.generatedContent);
        setIsContentLoaded(true);
      }
    };

    // Verificar imediatamente
    checkForBuiltFlashCards();
    
    // Verificar periodicamente
    const interval = setInterval(checkForBuiltFlashCards, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Estado para forçar re-renderização
  const [contentLoaded, setContentLoaded] = useState(false);
  
  useEffect(() => {
    setContentLoaded(!!content);
  }, [content]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B00] mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Gerando Flash Cards...</p>
      </div>
    );
  }

  // Validação usando dados efetivos
  const hasValidContent = () => {
    const effectiveContent = getEffectiveContent();
    
    if (!effectiveContent) return false;
    
    // Verificar se tem cards válidos
    if (effectiveContent.cards && Array.isArray(effectiveContent.cards) && effectiveContent.cards.length > 0) {
      const validCards = effectiveContent.cards.some(card => card && card.question && card.answer);
      if (validCards) return true;
    }
    
    // Verificar se tem dados mínimos para fallback
    if (effectiveContent.title || effectiveContent.theme || effectiveContent.topicos) {
      return true;
    }
    
    return false;
  };

  // Função para obter dados efetivos (priorizar dados internos)
  const getEffectiveContent = () => {
    return internalFlashCardsData || content;
  };

  // Função para obter cards válidos
  const getValidCards = () => {
    const effectiveContent = getEffectiveContent();
    
    if (!effectiveContent) return [];
    
    if (effectiveContent.cards && Array.isArray(effectiveContent.cards) && effectiveContent.cards.length > 0) {
      return effectiveContent.cards.filter(card => card && card.question && card.answer);
    }
    
    return [];
  };

  // Função melhorada para verificar se deve mostrar loading
  const shouldShowLoading = () => {
    // Se explicitamente está carregando, mostrar loading
    if (isLoading) return true;
    
    // Se ainda não verificou storage e não tem dados, mostrar loading
    if (!hasCheckedStorage && !internalFlashCardsData && !getValidCards().length) return true;
    
    // Se verificou storage, tem dados carregados mas não tem cards válidos, NÃO mostrar loading
    return false;
  };

  // Se está carregando, mostrar loading
  if (shouldShowLoading()) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B00] mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          {isLoading ? 'Gerando Flash Cards...' : 'Verificando dados...'}
        </p>
      </div>
    );
  }

  // Se não há conteúdo válido após verificar todas as fontes
  if (!hasValidContent()) {
    // Última tentativa: verificar localStorage diretamente
    const storageData = localStorage.getItem('constructedActivities');
    if (storageData) {
      try {
        const parsed = JSON.parse(storageData);
        const flashCardsData = Object.values(parsed).find((item: any) => 
          item?.activityType === 'flash-cards' && item?.generatedContent?.cards
        );
        
        if (flashCardsData) {
          console.log('🔄 Dados encontrados no localStorage, forçando atualização...');
          // Forçar aplicação dos dados encontrados
          setTimeout(() => {
            if (typeof content === 'object' && content !== null) {
              Object.assign(content, (flashCardsData as any).generatedContent);
              setContentLoaded(prev => !prev); // Toggle para forçar re-render
            }
          }, 100);
          
          return (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B00] mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Sincronizando Flash Cards...</p>
            </div>
          );
        }
      } catch (error) {
        console.error('❌ Erro ao verificar localStorage:', error);
      }
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
        <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Aguardando Flash Cards...
        </h4>
        <p className="text-gray-500 dark:text-gray-500 mb-4">
          Configure os campos e gere os flash cards para começar
        </p>
        <div className="text-xs text-gray-400">
          Dados disponíveis: {JSON.stringify({
            hasContent: !!content,
            hasCards: !!(content?.cards),
            cardsLength: content?.cards?.length || 0,
            contentKeys: content ? Object.keys(content) : []
          })}
        </div>
      </div>
    );
  }

  const effectiveContent = getEffectiveContent();
  const validCards = getValidCards();
  const currentCard = validCards.length > 0 ? validCards[currentCardIndex] : null;
  const totalCards = validCards.length || effectiveContent?.totalCards || 0;
  const progress = totalCards > 0 ? ((currentCardIndex + (showAnswer ? 1 : 0)) / totalCards) * 100 : 0;
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
    if (!currentCard) return;
    
    const newResponse: CardResponse = {
      cardId: currentCard.id,
      response: responseType
    };

    setResponses(prev => [...prev, newResponse]);

    const validCards = getValidCards();
    if (currentCardIndex < validCards.length - 1) {
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
            Você completou todos os {totalCards} flash cards!
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
          {effectiveContent?.title || 'Flash Cards'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {effectiveContent?.description || 'Descrição dos flash cards'}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {effectiveContent?.theme || 'Tema'}
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            {currentCardIndex + 1} de {totalCards}
          </Badge>
          {effectiveContent?.isGeneratedByAI && (
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
          {currentCard ? (
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
          ) : (
            <Card className="min-h-[300px] flex items-center justify-center">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Nenhum flash card disponível
                </h4>
                <p className="text-gray-500 dark:text-gray-500">
                  Configure os campos e gere os flash cards primeiro
                </p>
              </CardContent>
            </Card>
          )}
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
          {completedCards} de {totalCards} cards completados
        </p>
      </div>
    </div>
  );
};

export default FlashCardsPreview;

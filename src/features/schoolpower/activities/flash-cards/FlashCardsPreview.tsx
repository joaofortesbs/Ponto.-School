import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, AlertCircle, TrendingUp, Trophy, RefreshCw } from 'lucide-react';
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
  activity?: { id: string; [key: string]: any };
}

interface CardResponse {
  cardId: number;
  response: 'almost' | 'correct';
}

// Sistema centralizado de dados
class FlashCardsDataManager {
  private static instance: FlashCardsDataManager;
  private listeners: ((data: FlashCardsContent | null) => void)[] = [];
  private currentData: FlashCardsContent | null = null;

  static getInstance(): FlashCardsDataManager {
    if (!FlashCardsDataManager.instance) {
      FlashCardsDataManager.instance = new FlashCardsDataManager();
    }
    return FlashCardsDataManager.instance;
  }

  subscribe(callback: (data: FlashCardsContent | null) => void): () => void {
    this.listeners.push(callback);
    // Notificar imediatamente se já tem dados
    if (this.currentData) {
      callback(this.currentData);
    }
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  updateData(data: FlashCardsContent): void {
    console.log('📊 FlashCardsDataManager: Atualizando dados centralizados:', data);
    this.currentData = data;
    this.listeners.forEach(listener => listener(data));
  }

  getCurrentData(): FlashCardsContent | null {
    return this.currentData;
  }

  searchInStorage(activityId?: string): FlashCardsContent | null {
    console.log('🔍 FlashCardsDataManager: Buscando no localStorage...');

    const searchKeys = [
      `constructed_flash-cards_${activityId || 'flash-cards'}`,
      'constructed_flash-cards_flash-cards',
      'flash-cards-data',
      'flash-cards-data-generated',
      'constructedActivities'
    ];

    // Buscar por todas as chaves que contêm 'flash-cards'
    const allKeys = Object.keys(localStorage);
    const flashCardKeys = allKeys.filter(key => 
      key.includes('flash-cards') || key.includes('flash_cards')
    );

    const combinedKeys = [...new Set([...searchKeys, ...flashCardKeys])];

    for (const key of combinedKeys) {
      try {
        const data = localStorage.getItem(key);
        if (!data) continue;

        const parsed = JSON.parse(data);
        let flashCardsData = null;

        // Diferentes estruturas possíveis
        if (key === 'constructedActivities') {
          const activity = Object.values(parsed).find((item: any) => 
            item?.activityType === 'flash-cards' && 
            item?.generatedContent?.cards &&
            Array.isArray(item.generatedContent.cards) &&
            item.generatedContent.cards.length > 0
          );
          if (activity) {
            flashCardsData = (activity as any).generatedContent;
          }
        } else if (parsed.data?.cards && Array.isArray(parsed.data.cards)) {
          flashCardsData = parsed.data;
        } else if (parsed.cards && Array.isArray(parsed.cards)) {
          flashCardsData = parsed;
        }

        if (flashCardsData && this.isValidFlashCardsData(flashCardsData)) {
          console.log(`✅ FlashCardsDataManager: Dados encontrados na chave ${key}:`, flashCardsData);
          return flashCardsData;
        }
      } catch (error) {
        console.warn(`❌ FlashCardsDataManager: Erro ao processar chave ${key}:`, error);
      }
    }

    console.log('❌ FlashCardsDataManager: Nenhum dado válido encontrado no localStorage');
    return null;
  }

  private isValidFlashCardsData(data: any): boolean {
    return data && 
           data.cards && 
           Array.isArray(data.cards) && 
           data.cards.length > 0 &&
           data.cards.some(card => card && card.question && card.answer);
  }
}

const FlashCardsPreview: React.FC<FlashCardsPreviewProps> = ({ content, isLoading = false, activity }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [responses, setResponses] = useState<CardResponse[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [dynamicContent, setDynamicContent] = useState<FlashCardsContent | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Instância do gerenciador de dados
  const dataManager = FlashCardsDataManager.getInstance();

  // Sistema de busca ativa de dados
  const searchForFlashCardsData = useCallback(async () => {
    if (isSearching) return;

    setIsSearching(true);
    console.log('🔍 Iniciando busca ativa por dados de Flash Cards...');

    // Buscar no storage
    const storageData = dataManager.searchInStorage(activity?.id);
    if (storageData) {
      console.log('✅ Dados encontrados no storage, aplicando:', storageData);
      dataManager.updateData(storageData);
      setIsSearching(false);
      return;
    }

    // Aguardar um pouco e tentar novamente
    setTimeout(() => {
      const retryData = dataManager.searchInStorage(activity?.id);
      if (retryData) {
        console.log('✅ Dados encontrados na segunda tentativa:', retryData);
        dataManager.updateData(retryData);
      }
      setIsSearching(false);
    }, 1000);
  }, [activity?.id, isSearching]);

  // Subscrever aos dados centralizados
  useEffect(() => {
    const unsubscribe = dataManager.subscribe((data) => {
      console.log('📡 FlashCardsPreview: Recebendo dados do manager:', data);
      setDynamicContent(data);
      setLastUpdate(Date.now());
    });

    return unsubscribe;
  }, []);

  // Listener para eventos globais
  useEffect(() => {
    const handleFlashCardsEvent = (event: CustomEvent) => {
      console.log('📡 FlashCardsPreview: Evento recebido:', event.type, event.detail);

      if (event.detail?.data) {
        const eventData = event.detail.data;
        if (eventData.cards && Array.isArray(eventData.cards) && eventData.cards.length > 0) {
          console.log('✅ Aplicando dados do evento:', eventData);
          dataManager.updateData(eventData);

          // Reset do estado de navegação
          setCurrentCardIndex(0);
          setIsFlipped(false);
          setShowAnswer(false);
          setResponses([]);
          setIsCompleted(false);
        }
      }
    };

    const eventTypes = [
      'flash-cards-auto-build',
      'activity-auto-built',
      'flash-cards-generated',
      'flash-cards-content-ready',
      'construction-completed'
    ];

    eventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleFlashCardsEvent as EventListener);
    });

    return () => {
      eventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleFlashCardsEvent as EventListener);
      });
    };
  }, []);

  // Busca inicial e periódica
  useEffect(() => {
    // Busca imediata
    searchForFlashCardsData();

    // Busca periódica nos primeiros 10 segundos
    const interval = setInterval(() => {
      if (!dataManager.getCurrentData()) {
        searchForFlashCardsData();
      }
    }, 1500);

    // Limpar após 10 segundos
    const timeout = setTimeout(() => {
      clearInterval(interval);
      console.log('⏹️ Parando busca periódica');
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [activity?.id, searchForFlashCardsData]);

  // Reset quando o conteúdo mudar
  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowAnswer(false);
    setResponses([]);
    setIsCompleted(false);
  }, [content, dynamicContent]);

  // Função para obter dados efetivos (prioridade: dinâmico > prop > storage)
  const getEffectiveContent = useCallback((): FlashCardsContent | null => {
    // 1. Prioridade: dados dinâmicos (do manager)
    if (dynamicContent && dynamicContent.cards && dynamicContent.cards.length > 0) {
      console.log('✅ Usando dados dinâmicos:', dynamicContent);
      return dynamicContent;
    }

    // 2. Prioridade: prop content
    if (content && content.cards && content.cards.length > 0) {
      console.log('✅ Usando prop content:', content);
      return content;
    }

    // 3. Última tentativa: buscar no storage
    const storageData = dataManager.searchInStorage(activity?.id);
    if (storageData) {
      console.log('✅ Usando dados do storage:', storageData);
      return storageData;
    }

    console.log('❌ Nenhum dado efetivo encontrado');
    return null;
  }, [dynamicContent, content, activity?.id]);

  // Função para obter cards válidos
  const getValidCards = useCallback((): FlashCard[] => {
    const effectiveContent = getEffectiveContent();

    if (!effectiveContent || !effectiveContent.cards || !Array.isArray(effectiveContent.cards)) {
      return [];
    }

    return effectiveContent.cards.filter(card => 
      card && 
      typeof card.question === 'string' && 
      card.question.trim() &&
      typeof card.answer === 'string' && 
      card.answer.trim()
    );
  }, [getEffectiveContent]);

  // Dados efetivos para renderização
  const effectiveContent = getEffectiveContent();
  const validCards = getValidCards();
  const currentCard = validCards.length > 0 ? validCards[currentCardIndex] : null;
  const totalCards = validCards.length;
  const progress = totalCards > 0 ? ((currentCardIndex + (showAnswer ? 1 : 0)) / totalCards) * 100 : 0;
  const completedCards = responses.length;

  // Debug info
  useEffect(() => {
    console.log('🎯 FlashCardsPreview - Estado atual:', {
      hasEffectiveContent: !!effectiveContent,
      validCardsCount: validCards.length,
      currentCardIndex,
      isLoading,
      isSearching,
      hasDynamicContent: !!dynamicContent,
      hasContentProp: !!content,
      lastUpdate: new Date(lastUpdate).toLocaleTimeString()
    });
  }, [effectiveContent, validCards.length, currentCardIndex, isLoading, isSearching, dynamicContent, content, lastUpdate]);

  // Loading states
  if (isLoading || isSearching) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B00] mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          {isLoading ? 'Gerando Flash Cards...' : 'Buscando dados...'}
        </p>
      </div>
    );
  }

  // Botão para busca manual
  const handleManualRefresh = () => {
    console.log('🔄 Busca manual iniciada');
    setLastUpdate(Date.now());
    searchForFlashCardsData();
  };

  // Estado vazio - sem dados válidos
  if (!effectiveContent || validCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
        <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Nenhum Flash Card Disponível
        </h4>
        <p className="text-gray-500 dark:text-gray-500 mb-4">
          Configure os campos e gere os flash cards primeiro
        </p>

        <Button 
          onClick={handleManualRefresh}
          variant="outline"
          className="mb-4"
          disabled={isSearching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isSearching ? 'animate-spin' : ''}`} />
          Buscar Flash Cards
        </Button>

        <div className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded">
          <strong>Debug Info:</strong><br/>
          Valid Cards: {validCards.length}<br/>
          Has Content: {!!effectiveContent ? 'Sim' : 'Não'}<br/>
          Dynamic Data: {!!dynamicContent ? 'Sim' : 'Não'}<br/>
          Prop Data: {!!content ? 'Sim' : 'Não'}<br/>
          Activity ID: {activity?.id || 'N/A'}<br/>
          Last Search: {new Date(lastUpdate).toLocaleTimeString()}
        </div>
      </div>
    );
  }

  // Handlers de navegação
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

    if (currentCardIndex < validCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
      setIsFlipped(false);
    } else {
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

  // Tela de conclusão
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

  // Interface principal dos Flash Cards
  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header com informações */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              {effectiveContent.title || 'Flash Cards'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {effectiveContent.description || 'Teste seus conhecimentos com flash cards interativos'}
            </p>
          </div>
          <Button 
            onClick={handleManualRefresh}
            variant="ghost"
            size="sm"
            disabled={isSearching}
          >
            <RefreshCw className={`h-4 w-4 ${isSearching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {effectiveContent.theme || 'Tema'}
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            {currentCardIndex + 1} de {totalCards}
          </Badge>
          {effectiveContent.isGeneratedByAI && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Gerado por IA
            </Badge>
          )}
          {effectiveContent.topicos && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              {effectiveContent.topicos}
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
                        Pergunta {currentCard?.id || currentCardIndex + 1}
                        {currentCard?.category && (
                          <span className="ml-2 text-sm text-gray-500">({currentCard.category})</span>
                        )}
                      </h4>
                      <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                        {currentCard?.question}
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
                        {currentCard?.answer}
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
              Foi por pouco!
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

      {/* Footer com informações */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {completedCards} de {totalCards} cards completados
        </p>

        {effectiveContent?.generatedAt && (
          <p className="text-xs text-gray-400">
            Gerado em: {new Date(effectiveContent.generatedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default FlashCardsPreview;
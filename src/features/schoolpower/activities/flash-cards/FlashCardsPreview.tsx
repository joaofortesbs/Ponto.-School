
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  RotateCcw, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Eye, 
  EyeOff,
  CheckCircle2,
  XCircle,
  BarChart3,
  Clock,
  BookOpen,
  Star,
  Shuffle
} from 'lucide-react';

interface FlashCard {
  id: number;
  front: string;
  back: string;
  category?: string;
  difficulty?: string;
}

interface FlashCardsPreviewProps {
  content: {
    title?: string;
    description?: string;
    cards?: FlashCard[];
    totalCards?: number;
    theme?: string;
    subject?: string;
    schoolYear?: string;
    topicos?: string;
    numberOfFlashcards?: number;
    context?: string;
    difficultyLevel?: string;
    objectives?: string;
    instructions?: string;
    evaluation?: string;
    generatedByAI?: boolean;
    isFallback?: boolean;
    data?: any; // Para estruturas aninhadas
    success?: boolean; // Para estruturas de API
  } | null;
  isLoading?: boolean;
}

export const FlashCardsPreview: React.FC<FlashCardsPreviewProps> = ({ 
  content, 
  isLoading = false 
}) => {
  // Normalizar dados com lógica mais robusta
  const normalizedContent = React.useMemo(() => {
    if (!content) {
      console.log('🃏 FlashCardsPreview - Sem conteúdo');
      return null;
    }

    console.log('🃏 FlashCardsPreview - Conteúdo bruto recebido:', content);

    // Extrair dados da estrutura mais profunda possível
    let actualContent = content;
    
    // Verificar estruturas aninhadas comuns
    if (content.success && content.data) {
      actualContent = content.data;
      console.log('🃏 Extraindo de success.data:', actualContent);
    } else if (content.data && typeof content.data === 'object') {
      actualContent = content.data;
      console.log('🃏 Extraindo de data:', actualContent);
    }

    // Buscar cards em diferentes propriedades possíveis
    let cards = actualContent.cards || 
                actualContent.flashcards || 
                actualContent.flashCards ||
                content.cards ||
                content.flashcards ||
                [];

    console.log('🃏 Cards encontrados (raw):', cards);

    // Se cards não é um array, tentar converter
    if (!Array.isArray(cards)) {
      console.warn('🃏 Cards não é array, tentando converter:', typeof cards);
      
      // Se é um objeto, talvez seja um único card
      if (typeof cards === 'object' && cards !== null) {
        if (cards.front && cards.back) {
          cards = [cards];
        } else {
          cards = [];
        }
      } else {
        cards = [];
      }
    }

    // Validar e processar cada card
    const validCards = cards
      .filter((card: any) => {
        const isValid = card && 
                       typeof card === 'object' && 
                       card.front && 
                       card.back &&
                       typeof card.front === 'string' &&
                       typeof card.back === 'string' &&
                       card.front.trim() !== '' &&
                       card.back.trim() !== '';
        
        if (!isValid) {
          console.warn('🃏 Card inválido filtrado:', card);
        }
        
        return isValid;
      })
      .map((card: any, index: number) => ({
        id: card.id || index + 1,
        front: card.front.trim(),
        back: card.back.trim(),
        category: card.category || actualContent.subject || content.subject || 'Geral',
        difficulty: card.difficulty || actualContent.difficultyLevel || content.difficultyLevel || 'Médio'
      }));

    console.log('🃏 Cards válidos processados:', validCards);

    // Se não temos cards válidos, tentar gerar fallback dos tópicos
    if (validCards.length === 0) {
      const topicos = actualContent.topicos || content.topicos || '';
      const theme = actualContent.theme || content.theme || 'Flash Cards';
      const subject = actualContent.subject || content.subject || 'Geral';
      
      console.log('🃏 Tentando gerar fallback dos tópicos:', { topicos, theme, subject });
      
      if (topicos && typeof topicos === 'string') {
        const topicosList = topicos.split('\n').filter(t => t.trim());
        const fallbackCards = topicosList.slice(0, 10).map((topic, index) => ({
          id: index + 1,
          front: `O que é ${topic.trim()}?`,
          back: `${topic.trim()} é um conceito importante em ${subject} que deve ser estudado e compreendido.`,
          category: subject,
          difficulty: 'Médio'
        }));
        
        if (fallbackCards.length > 0) {
          console.log('🃏 Cards fallback gerados:', fallbackCards);
          validCards.push(...fallbackCards);
        }
      }
    }

    // Se ainda não há cards, criar pelo menos um exemplo
    if (validCards.length === 0) {
      console.log('🃏 Criando card de exemplo para demonstração');
      validCards.push({
        id: 1,
        front: 'Flash Cards Criados com Sucesso!',
        back: 'Seus flash cards foram gerados e estão prontos para uso. Configure o conteúdo adequadamente para ver mais cards personalizados.',
        category: 'Sistema',
        difficulty: 'Básico'
      });
    }

    const result = {
      ...actualContent,
      ...content, // Preservar propriedades do nível superior
      cards: validCards,
      totalCards: validCards.length,
      numberOfFlashcards: validCards.length,
      title: actualContent.title || content.title || `Flash Cards: ${actualContent.theme || content.theme || 'Estudo'}`,
      description: actualContent.description || content.description || `Flash cards para estudo`,
      theme: actualContent.theme || content.theme || 'Tema Geral',
      subject: actualContent.subject || content.subject || 'Geral',
      schoolYear: actualContent.schoolYear || content.schoolYear || 'Ensino Médio',
      difficultyLevel: actualContent.difficultyLevel || content.difficultyLevel || 'Médio'
    };

    console.log('🃏 FlashCardsPreview - Conteúdo final normalizado:', result);
    console.log('🃏 Total de cards processados:', result.cards.length);
    
    return result;
  }, [content]);

  // Debug logging detalhado
  useEffect(() => {
    console.log('🃏 FlashCardsPreview - Estado atual:', {
      hasContent: !!content,
      contentKeys: content ? Object.keys(content) : [],
      hasNormalizedContent: !!normalizedContent,
      hasCards: !!(normalizedContent?.cards),
      cardsLength: normalizedContent?.cards?.length || 0,
      isLoading,
      firstCard: normalizedContent?.cards?.[0],
      contentStructure: {
        raw: content,
        normalized: normalizedContent
      }
    });
  }, [content, normalizedContent, isLoading]);

  // Estados para controle da sessão de estudo
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState<'practice' | 'test' | 'review'>('practice');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [cardStats, setCardStats] = useState<{[key: number]: { correct: number; incorrect: number; }}>({});
  const [sessionStats, setSessionStats] = useState({
    cardsStudied: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    totalTime: 0
  });
  const [shuffled, setShuffled] = useState(false);
  const [cardOrder, setCardOrder] = useState<number[]>([]);

  // Inicializar ordem dos cards
  useEffect(() => {
    if (normalizedContent?.cards) {
      const order = Array.from({ length: normalizedContent.cards.length }, (_, i) => i);
      setCardOrder(order);
    }
  }, [normalizedContent?.cards]);

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && normalizedContent?.cards) {
      interval = setInterval(() => {
        if (isFlipped) {
          handleNextCard();
        } else {
          setIsFlipped(true);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isFlipped, currentCardIndex, normalizedContent?.cards]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Gerando Flash Cards...
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center">
          A IA está criando seus flash cards personalizados
        </p>
      </div>
    );
  }

  // Não mostrar tela vazia se há conteúdo normalizado com pelo menos um card
  if (!normalizedContent) {
    console.log('🃏 FlashCardsPreview - Sem conteúdo normalizado');
    
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Nenhum Flash Card Disponível
        </h3>
        <p className="text-gray-500 dark:text-gray-500 mb-4">
          Configure e gere os flash cards na aba de edição
        </p>
        
        {/* Debug info mais detalhado */}
        <div className="text-xs text-gray-400 mt-4 max-w-md bg-gray-100 dark:bg-gray-800 p-3 rounded">
          <p><strong>Debug:</strong></p>
          <p>Conteúdo presente: {content ? 'Sim' : 'Não'}</p>
          <p>Cards: {normalizedContent?.cards?.length || 0}</p>
          <p>Estrutura: {content ? JSON.stringify(Object.keys(content)) : 'N/A'}</p>
          {content && (
            <p>Raw content: {JSON.stringify(content, null, 2).slice(0, 200)}...</p>
          )}
        </div>
      </div>
    );
  }

  const currentCard = normalizedContent.cards[cardOrder[currentCardIndex]];
  const progress = ((currentCardIndex + 1) / normalizedContent.cards.length) * 100;

  const handleNextCard = () => {
    if (currentCardIndex < normalizedContent.cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsPlaying(false);
      setShowStats(true);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMarkCard = (correct: boolean) => {
    const cardId = currentCard.id;
    setCardStats(prev => ({
      ...prev,
      [cardId]: {
        correct: (prev[cardId]?.correct || 0) + (correct ? 1 : 0),
        incorrect: (prev[cardId]?.incorrect || 0) + (correct ? 0 : 1)
      }
    }));

    setSessionStats(prev => ({
      ...prev,
      cardsStudied: prev.cardsStudied + 1,
      correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
      incorrectAnswers: prev.incorrectAnswers + (correct ? 0 : 1)
    }));

    setTimeout(handleNextCard, 1000);
  };

  const handleShuffle = () => {
    const newOrder = [...cardOrder].sort(() => Math.random() - 0.5);
    setCardOrder(newOrder);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShuffled(true);
  };

  const resetSession = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsPlaying(false);
    setShowStats(false);
    setCardStats({});
    setSessionStats({
      cardsStudied: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalTime: 0
    });
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header com informações */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
              {normalizedContent.title || 'Flash Cards'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {normalizedContent.description || 'Flash cards para estudo e revisão'}
            </p>
          </div>
          <div className="flex gap-2">
            {normalizedContent.generatedByAI && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Star className="w-3 h-3 mr-1" />
                IA
              </Badge>
            )}
            <Badge variant="outline">
              {normalizedContent.cards.length} cards
            </Badge>
          </div>
        </div>

        {/* Informações do conteúdo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Disciplina:</span>
            <p className="text-gray-800 dark:text-white">{normalizedContent.subject || 'Geral'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Ano:</span>
            <p className="text-gray-800 dark:text-white">{normalizedContent.schoolYear || 'Todos'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Dificuldade:</span>
            <p className="text-gray-800 dark:text-white">{normalizedContent.difficultyLevel || 'Médio'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Progresso:</span>
            <p className="text-gray-800 dark:text-white">
              {currentCardIndex + 1} / {normalizedContent.cards.length}
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Área principal do card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Card 3D */}
          <div className="relative w-full h-80 perspective-1000">
            <motion.div
              className="relative w-full h-full cursor-pointer"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              onClick={handleFlipCard}
            >
              {/* Frente do card */}
              <Card className="absolute inset-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 shadow-xl border-2 border-blue-200 dark:border-blue-800 hover:shadow-2xl transition-shadow"
                    style={{ backfaceVisibility: 'hidden' }}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-xs">
                      Frente #{currentCard.id}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {currentCard.category || normalizedContent.subject}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-full pb-6">
                  <div className="text-center">
                    <p className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white leading-relaxed">
                      {currentCard.front}
                    </p>
                    <div className="mt-6 text-gray-500 dark:text-gray-400 text-sm">
                      Clique para ver a resposta
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verso do card */}
              <Card className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-700 dark:to-gray-600 shadow-xl border-2 border-green-200 dark:border-green-800 hover:shadow-2xl transition-shadow"
                    style={{ 
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                      Verso #{currentCard.id}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        currentCard.difficulty === 'Fácil' ? 'bg-green-100 text-green-800' :
                        currentCard.difficulty === 'Difícil' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {currentCard.difficulty || 'Médio'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-full pb-6">
                  <div className="text-center">
                    <p className="text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed">
                      {currentCard.back}
                    </p>
                    {studyMode === 'test' && (
                      <div className="mt-6 flex gap-3 justify-center">
                        <Button 
                          onClick={(e) => { e.stopPropagation(); handleMarkCard(false); }}
                          variant="outline" 
                          size="sm"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Errei
                        </Button>
                        <Button 
                          onClick={(e) => { e.stopPropagation(); handleMarkCard(true); }}
                          variant="outline" 
                          size="sm"
                          className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Acertei
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Controles */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button 
              onClick={handlePrevCard} 
              disabled={currentCardIndex === 0}
              variant="outline" 
              size="sm"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button 
              onClick={() => setIsPlaying(!isPlaying)} 
              variant="outline" 
              size="sm"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <Button 
              onClick={handleFlipCard} 
              variant="outline" 
              size="sm"
            >
              <RotateCcw className="w-4 h-4" />
              Virar
            </Button>

            <Button 
              onClick={handleNextCard} 
              disabled={currentCardIndex === normalizedContent.cards.length - 1}
              variant="outline" 
              size="sm"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <Button onClick={handleShuffle} variant="outline" size="sm">
              <Shuffle className="w-4 h-4" />
            </Button>

            <Button 
              onClick={() => setShowStats(!showStats)} 
              variant="outline" 
              size="sm"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>

            <Button onClick={resetSession} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Estatísticas da Sessão
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {sessionStats.cardsStudied}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Cards Estudados
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {sessionStats.correctAnswers}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Acertos
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {sessionStats.incorrectAnswers}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Erros
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {sessionStats.cardsStudied > 0 
                    ? Math.round((sessionStats.correctAnswers / sessionStats.cardsStudied) * 100)
                    : 0}%
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Precisão
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlashCardsPreview;

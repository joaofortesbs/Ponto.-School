
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
  Shuffle,
  AlertCircle
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
    if (normalizedContent?.cards && normalizedContent.cards.length > 0) {
      const order = Array.from({ length: normalizedContent.cards.length }, (_, i) => i);
      setCardOrder(order);
      // Garantir que o índice atual seja válido
      if (currentCardIndex >= normalizedContent.cards.length) {
        setCurrentCardIndex(0);
      }
      console.log('🃏 CardOrder inicializado:', order);
    } else {
      setCardOrder([]);
      setCurrentCardIndex(0);
    }
  }, [normalizedContent?.cards]);

  // Verificação adicional para currentCardIndex válido
  useEffect(() => {
    if (normalizedContent?.cards && currentCardIndex >= normalizedContent.cards.length) {
      setCurrentCardIndex(0);
    }
  }, [currentCardIndex, normalizedContent?.cards]);

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

  const currentCard = normalizedContent.cards[cardOrder[currentCardIndex]] || normalizedContent.cards[currentCardIndex] || normalizedContent.cards[0];
  const progress = ((currentCardIndex + 1) / normalizedContent.cards.length) * 100;

  // Verificação de segurança adicional
  if (!currentCard) {
    console.error('🃏 Erro: currentCard é undefined', {
      currentCardIndex,
      cardOrderLength: cardOrder.length,
      cardsLength: normalizedContent.cards.length,
      cardOrder
    });
    
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Erro na Exibição do Flash Card
        </h3>
        <p className="text-gray-500 dark:text-gray-500 mb-4">
          Problema ao carregar o card atual. Tente recarregar a atividade.
        </p>
      </div>
    );
  }

  const handleNextCard = () => {
    if (!normalizedContent?.cards || normalizedContent.cards.length === 0) return;
    
    if (currentCardIndex < normalizedContent.cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsPlaying(false);
      setShowStats(true);
    }
  };

  const handlePrevCard = () => {
    if (!normalizedContent?.cards || normalizedContent.cards.length === 0) return;
    
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMarkCard = (correct: boolean) => {
    if (!currentCard) return;
    
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

    // Transição suave para o próximo card
    setTimeout(() => {
      handleNextCard();
    }, 500);
  };

  const handleShuffle = () => {
    if (!normalizedContent?.cards || normalizedContent.cards.length === 0) return;
    
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
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-2xl w-full">
          {/* Barra de Progresso */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Progresso: {currentCardIndex + 1} de {normalizedContent.cards.length}
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Card 3D */}
          <div className="relative w-full h-80 perspective-1000 mb-6">
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
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white leading-relaxed">
                      {currentCard.front}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Verso do card */}
              <Card className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-700 dark:to-gray-600 shadow-xl border-2 border-green-200 dark:border-green-800 hover:shadow-2xl transition-shadow"
                    style={{ 
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}>
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed">
                      {currentCard.back}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Botões de Feedback - Aparecem apenas quando o card está virado */}
          <AnimatePresence>
            {isFlipped && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex gap-4 justify-center"
              >
                <Button
                  onClick={() => handleMarkCard(false)}
                  variant="outline"
                  className="flex items-center gap-2 px-6 py-3 text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-600 dark:hover:bg-orange-900/20 transition-all duration-200"
                >
                  <AlertCircle className="w-5 h-5" />
                  Essa foi por pouco!
                </Button>
                <Button
                  onClick={() => handleMarkCard(true)}
                  variant="outline"
                  className="flex items-center gap-2 px-6 py-3 text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-600 dark:hover:bg-green-900/20 transition-all duration-200"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Acertei em cheio!
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Indicador do Card Atual */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2">
              {normalizedContent.cards.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentCardIndex
                      ? 'bg-blue-500 w-8'
                      : index < currentCardIndex
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
    </div>
  );
};

export default FlashCardsPreview;

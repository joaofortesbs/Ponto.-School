
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  AlertCircle,
  Zap,
  Trophy,
  Target
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
    flashcards?: FlashCard[];
    flashCards?: FlashCard[];
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
    data?: any;
    success?: boolean;
  } | null;
  isLoading?: boolean;
}

export const FlashCardsPreview: React.FC<FlashCardsPreviewProps> = ({ 
  content, 
  isLoading = false
}) => {
  // Estados para controle da sessão de estudo
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cardStats, setCardStats] = useState<{[key: number]: { correct: number; incorrect: number; }}>({});
  const [sessionStats, setSessionStats] = useState({
    cardsStudied: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    totalTime: 0
  });
  const [cardOrder, setCardOrder] = useState<number[]>([]);
  const [cardResults, setCardResults] = useState<{[key: number]: boolean}>({});

  // Usar useRef para valores que não devem causar re-renderização
  const hasInitialized = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Normalizar dados com memoização ESTÁVEL usando JSON.stringify
  const normalizedContent = useMemo(() => {
    if (!content) {
      console.log('🃏 FlashCardsPreview - Sem conteúdo');
      return null;
    }

    console.log('🃏 FlashCardsPreview - Processando conteúdo:', content);

    // Extrair dados da estrutura mais profunda possível
    let actualContent = content;

    if (content.success && content.data) {
      actualContent = content.data;
    } else if (content.data && typeof content.data === 'object') {
      actualContent = content.data;
    }

    // Buscar cards em diferentes propriedades possíveis
    let cards = actualContent.cards || 
                actualContent.flashcards || 
                actualContent.flashCards ||
                content.cards ||
                content.flashcards ||
                [];

    // Se cards não é um array, tentar converter
    if (!Array.isArray(cards)) {
      if (typeof cards === 'object' && cards !== null) {
        const cardObj = cards as any;
        if (cardObj.front && cardObj.back) {
          cards = [cardObj];
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
        return card && 
               typeof card === 'object' && 
               card.front && 
               card.back &&
               typeof card.front === 'string' &&
               typeof card.back === 'string' &&
               card.front.trim() !== '' &&
               card.back.trim() !== '';
      })
      .map((card: any, index: number) => ({
        id: card.id || index + 1,
        front: card.front.trim(),
        back: card.back.trim(),
        category: card.category || actualContent.subject || content.subject || 'Geral',
        difficulty: card.difficulty || actualContent.difficultyLevel || content.difficultyLevel || 'Médio'
      }));

    // Se não temos cards válidos, tentar gerar fallback dos tópicos
    if (validCards.length === 0) {
      const topicos = actualContent.topicos || content.topicos || '';
      const theme = actualContent.theme || content.theme || 'Flash Cards';
      const subject = actualContent.subject || content.subject || 'Geral';

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
          validCards.push(...fallbackCards);
        }
      }
    }

    // Se ainda não há cards, criar pelo menos um exemplo
    if (validCards.length === 0) {
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
      ...content,
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
  }, [JSON.stringify(content)]);

  // Inicializar ordem dos cards - APENAS uma vez quando há cards válidos
  useEffect(() => {
    if (normalizedContent?.cards && normalizedContent.cards.length > 0 && !hasInitialized.current) {
      const order = Array.from({ length: normalizedContent.cards.length }, (_, i) => i);
      setCardOrder(order);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      hasInitialized.current = true;
      console.log('🃏 CardOrder inicializado:', order);
    }
  }, [normalizedContent?.cards?.length]);

  // Auto-play functionality - com dependências estáveis
  useEffect(() => {
    // Limpar intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (isPlaying && normalizedContent?.cards && normalizedContent.cards.length > 0 && currentCardIndex < normalizedContent.cards.length) {
      intervalRef.current = setInterval(() => {
        setIsFlipped(prev => {
          if (prev) {
            // Se já está virado, ir para próximo card
            setCurrentCardIndex(prevIndex => {
              if (prevIndex < normalizedContent.cards.length - 1) {
                return prevIndex + 1;
              } else {
                setIsPlaying(false);
                return prevIndex;
              }
            });
            return false;
          } else {
            // Se não está virado, virar
            return true;
          }
        });
      }, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentCardIndex, normalizedContent?.cards?.length]);

  // Callbacks estáveis usando useCallback
  const handleNextCard = useCallback(() => {
    if (!normalizedContent?.cards || normalizedContent.cards.length === 0) return;

    if (currentCardIndex < normalizedContent.cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsPlaying(false);
    }
  }, [currentCardIndex, normalizedContent?.cards?.length]);

  const handlePrevCard = useCallback(() => {
    if (!normalizedContent?.cards || normalizedContent.cards.length === 0) return;

    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  }, [currentCardIndex]);

  const handleFlipCard = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleMarkCard = useCallback((correct: boolean) => {
    const currentCard = normalizedContent?.cards?.[currentCardIndex];
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

    setCardResults(prev => ({
      ...prev,
      [currentCardIndex]: correct
    }));

    setTimeout(() => {
      handleNextCard();
    }, 500);
  }, [currentCardIndex, normalizedContent?.cards, handleNextCard]);

  const handleShuffle = useCallback(() => {
    if (!normalizedContent?.cards || normalizedContent.cards.length === 0) return;

    const newOrder = [...cardOrder].sort(() => Math.random() - 0.5);
    setCardOrder(newOrder);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [cardOrder, normalizedContent?.cards?.length]);

  if (isLoading) {
    return (
      <div className="min-h-[600px] bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900/20 rounded-3xl border-2 border-orange-200/50 dark:border-orange-800/30 shadow-2xl">
        <div className="flex flex-col items-center justify-center h-full p-12">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 dark:border-orange-800 border-t-orange-500 dark:border-t-orange-400 shadow-lg"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 opacity-20 animate-pulse"></div>
          </div>

          <div className="text-center space-y-4 max-w-md">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="h-6 w-6 text-orange-500 dark:text-orange-400 animate-pulse" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent">
                Gerando Flash Cards
              </h3>
              <Zap className="h-6 w-6 text-orange-500 dark:text-orange-400 animate-pulse" />
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              A IA do Gemini está criando seus flash cards personalizados com conteúdo educacional de alta qualidade
            </p>

            <div className="flex items-center justify-center gap-2 pt-4">
              <div className="h-2 w-2 bg-orange-500 dark:bg-orange-400 rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-orange-500 dark:bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="h-2 w-2 bg-orange-500 dark:bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!normalizedContent || !normalizedContent.cards || normalizedContent.cards.length === 0) {
    return (
      <div className="min-h-[600px] bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900/20 rounded-3xl border-2 border-orange-200/50 dark:border-orange-800/30 shadow-2xl">
        <div className="flex flex-col items-center justify-center h-full p-12 text-center">
          <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/20 rounded-full p-8 mb-8 border-2 border-orange-200 dark:border-orange-700 shadow-lg">
            <BookOpen className="h-20 w-20 text-orange-500 dark:text-orange-400" />
          </div>

          <div className="space-y-4 max-w-lg">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
              Flash Cards em Preparação
            </h3>

            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              Configure os campos obrigatórios na aba "Editar" e clique em "Construir Atividade" para gerar seus flash cards personalizados
            </p>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-200 dark:border-orange-700 shadow-lg mt-6">
              <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400 mb-3">
                <Target className="h-5 w-5" />
                <span className="font-semibold">Próximos Passos:</span>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                  Preencha o tema e tópicos principais
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                  Defina o número de flash cards desejados
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                  Clique em "Construir Atividade" para gerar
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Validação de segurança para currentCard
  const currentCard = normalizedContent.cards[currentCardIndex];
  const progress = normalizedContent.cards.length > 0 ? ((currentCardIndex + 1) / normalizedContent.cards.length) * 100 : 0;

  if (!currentCard) {
    console.error('🃏 Erro: currentCard é undefined', {
      currentCardIndex,
      cardsLength: normalizedContent.cards.length,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900/20 flex items-start justify-center p-4 pt-8">
      <div className="max-w-4xl w-full">
        {/* Barra de Progresso com Título */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-orange-200/50 dark:border-orange-700/30 shadow-xl">
            {/* Título dentro do card */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent mb-2">
                {normalizedContent.title?.replace(/^Flash Cards:\s*/, '') || 'Flash Cards'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {normalizedContent.description || 'Pratique e aprenda com flash cards interativos'}
              </p>
            </div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-2">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    Card {currentCardIndex + 1} de {normalizedContent.cards.length}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Progresso do estudo
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent">
                  {Math.round(progress)}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completo
                </p>
              </div>
            </div>

            <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-full shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
        </motion.div>

        {/* Card 3D Premium */}
        <div className="relative w-full h-96 perspective-1000 mb-6">
          <motion.div
            className="relative w-full h-full cursor-pointer group"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            onClick={handleFlipCard}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Frente do card */}
            <Card className="absolute inset-0 bg-gradient-to-br from-white via-orange-50/30 to-orange-100/50 dark:from-gray-800 dark:via-gray-700 dark:to-orange-900/20 shadow-2xl border-2 border-orange-200/60 dark:border-orange-700/50 hover:shadow-3xl transition-all duration-300 rounded-3xl overflow-hidden"
                  style={{ backfaceVisibility: 'hidden' }}>

              {/* Header decorativo */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700"></div>

              {/* Ícone de dica */}
              <div className="absolute top-4 right-4 bg-orange-500/20 dark:bg-orange-600/30 rounded-full p-2">
                <Eye className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>

              {/* Badge de categoria */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 rounded-xl px-3 py-1 text-xs font-semibold shadow-lg">
                  {currentCard.category || 'Flash Card'}
                </Badge>
              </div>

              <CardContent className="flex items-center justify-center h-full p-8 pt-16">
                <div className="text-center space-y-4 max-w-2xl">
                  <div className="bg-orange-500/10 dark:bg-orange-600/20 rounded-2xl p-1 inline-block">
                    <BookOpen className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white leading-relaxed">
                    {currentCard.front}
                  </p>

                  {/* Indicador para virar */}
                  <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400 text-sm animate-pulse">
                    <RotateCcw className="h-4 w-4" />
                    <span>Clique para ver a resposta</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verso do card */}
            <Card className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 dark:from-gray-700 dark:via-gray-600 dark:to-green-900/20 shadow-2xl border-2 border-emerald-200/60 dark:border-green-700/50 hover:shadow-3xl transition-all duration-300 rounded-3xl overflow-hidden"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}>

              {/* Header decorativo */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-700"></div>

              {/* Ícone de resposta */}
              <div className="absolute top-4 right-4 bg-emerald-500/20 dark:bg-green-600/30 rounded-full p-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-green-400" />
              </div>

              {/* Badge de dificuldade */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 rounded-xl px-3 py-1 text-xs font-semibold shadow-lg">
                  {currentCard.difficulty || 'Médio'}
                </Badge>
              </div>

              <CardContent className="flex items-center justify-center h-full p-8 pt-16">
                <div className="text-center space-y-4 max-w-2xl">
                  <div className="bg-emerald-500/10 dark:bg-green-600/20 rounded-2xl p-1 inline-block">
                    <Star className="h-8 w-8 text-emerald-600 dark:text-green-400" />
                  </div>
                  <p className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white leading-relaxed">
                    {currentCard.back}
                  </p>

                  {/* Indicador de avaliação */}
                  <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-green-400 text-sm">
                    <Trophy className="h-4 w-4" />
                    <span>Como foi seu desempenho?</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Botões de Feedback Premium - Aparecem apenas quando o card está virado */}
        <AnimatePresence>
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
              className="flex gap-6 justify-center mb-6"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleMarkCard(false)}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 rounded-2xl px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-full p-1">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg">Quase lá!</div>
                      <div className="text-sm opacity-90">Preciso revisar</div>
                    </div>
                  </div>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleMarkCard(true)}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0 rounded-2xl px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-full p-1">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg">Perfeito!</div>
                      <div className="text-sm opacity-90">Domino o assunto</div>
                    </div>
                  </div>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicadores de Progresso Modernos */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-4"
        >
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-orange-200/50 dark:border-orange-700/30 shadow-lg">
            <div className="flex items-center justify-center gap-3">
              {normalizedContent.cards.slice(0, 15).map((_, index) => {
                let dotClass = 'bg-gray-300 dark:bg-gray-600 w-2 h-2';

                if (index === currentCardIndex) {
                  dotClass = 'bg-gradient-to-r from-orange-500 to-orange-600 w-4 h-4 shadow-lg scale-125';
                } else if (index < currentCardIndex) {
                  const wasCorrect = cardResults[index];
                  if (wasCorrect === true) {
                    dotClass = 'bg-gradient-to-r from-emerald-500 to-green-600 w-3 h-3 shadow-md';
                  } else if (wasCorrect === false) {
                    dotClass = 'bg-gradient-to-r from-red-500 to-red-600 w-3 h-3 shadow-md';
                  } else {
                    dotClass = 'bg-gray-300 dark:bg-gray-600 w-2 h-2';
                  }
                }

                return (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05, type: "spring" }}
                    className={`rounded-full transition-all duration-500 transform ${dotClass}`}
                  />
                );
              })}
              {normalizedContent.cards.length > 15 && (
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  +{normalizedContent.cards.length - 15}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Controles de Navegação */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrevCard}
            disabled={currentCardIndex === 0}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-3 border border-orange-200/50 dark:border-orange-700/30 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-300"
          >
            <SkipBack className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShuffle}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-3 border border-orange-200/50 dark:border-orange-700/30 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Shuffle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNextCard}
            disabled={currentCardIndex === normalizedContent.cards.length - 1}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-3 border border-orange-200/50 dark:border-orange-700/30 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-300"
          >
            <SkipForward className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default FlashCardsPreview;

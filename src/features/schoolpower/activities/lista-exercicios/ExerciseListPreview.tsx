import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Circle, Edit3, FileText, Clock, GraduationCap, BookOpen, Target, List, AlertCircle, RefreshCw, Hash, Zap, HelpCircle, Info, X, Wand2, BookOpen as Material, Video, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

// Sistema de mapeamento de dificuldade
const DIFFICULTY_LEVELS = {
  'fácil': { label: 'Fácil', color: 'bg-green-200', textColor: 'text-green-800' },
  'médio': { label: 'Médio', color: 'bg-yellow-200', textColor: 'text-yellow-800' },
  'difícil': { label: 'Difícil', color: 'bg-red-200', textColor: 'text-red-800' },
  'extremo': { label: 'Extremo', color: 'bg-red-600', textColor: 'text-white' }
};

// Sistema de geração automática de tags
const generateQuestionTag = (enunciado: string, alternativas?: string[]): string => {
  const text = (enunciado + ' ' + (alternativas?.join(' ') || '')).toLowerCase();

  // Tags matemáticas específicas
  if (text.match(/calcul|resolv|determin|encontr|valor|some|subtra|multipl|divid/)) return 'Cálculo';
  if (text.match(/gráfico|eixo|coordenada|plano|cartesian|abscissa|ordenada/)) return 'Gráfico';
  if (text.match(/equação|resolve|incógnita|variável|x\s*=|y\s*=/)) return 'Equação';
  if (text.match(/função|f\(x\)|g\(x\)|domínio|imagem|contradomínio/)) return 'Função';
  if (text.match(/geometri|área|perímetro|volume|triângulo|círculo|quadrado|retângulo/)) return 'Geometria';
  if (text.match(/probabilidade|estatística|média|moda|mediana|desvio|amostra/)) return 'Estatística';
  if (text.match(/zero|raiz|coeficiente|grau|polinôm/)) return 'Álgebra';
  if (text.match(/crescente|decrescente|máximo|mínimo|derivada/)) return 'Análise';
  if (text.match(/matriz|determinante|sistema|linear/)) return 'Algebra Linear';
  if (text.match(/seno|cosseno|tangente|trigonometr/)) return 'Trigonometria';

  // Tags de português
  if (text.match(/texto|interpret|compreen|análise|leitura|passagem/)) return 'Interpretação';
  if (text.match(/gramática|sintaxe|morfologi|ortografi|pontuação/)) return 'Gramática';
  if (text.match(/redação|produção|escrit|dissertaç|argumentaç/)) return 'Redação';
  if (text.match(/literatura|poem|roman|autor|literári/)) return 'Literatura';
  if (text.match(/narrativ|conto|crônica|fábula/)) return 'Narrativa';
  if (text.match(/verbo|substantiv|adjetiv|advérbi/)) return 'Morfologia';

  // Tags de ciências
  if (text.match(/célula|organism|biologi|ecologi|evolução|genética/)) return 'Biologia';
  if (text.match(/átomo|molécula|química|reação|elemento|tabela periódica/)) return 'Química';
  if (text.match(/força|energia|física|movimento|velocidade|aceleração/)) return 'Física';
  if (text.match(/experimental|laboratório|observação|hipótese/)) return 'Experimento';

  // Tags de história/geografia
  if (text.match(/históri|época|período|civilizaç|guerra|revolução/)) return 'História';
  if (text.match(/geografi|clima|relevo|população|país|continente/)) return 'Geografia';
  if (text.match(/economi|mercado|comércio|moeda/)) return 'Economia';
  if (text.match(/polític|governo|democraci|constituição/)) return 'Política';

  // Tags de inglês
  if (text.match(/english|verb|noun|adjective|grammar/)) return 'Grammar';
  if (text.match(/vocabulary|word|meaning|definition/)) return 'Vocabulary';
  if (text.match(/reading|comprehension|text|passage/)) return 'Reading';

  // Tags gerais por tipo de ação
  if (text.match(/anális|observ|compar|contrast|diferenç/)) return 'Análise';
  if (text.match(/concept|defin|significa|caracteriz/)) return 'Conceito';
  if (text.match(/aplicaç|prática|exemplo|uso|utiliz/)) return 'Aplicação';
  if (text.match(/classific|categori|tipo|espécie/)) return 'Classificação';
  if (text.match(/identific|reconhec|apont|indic/)) return 'Identificação';
  if (text.match(/explicaç|justific|porqu|causa|motivo/)) return 'Explicação';
  if (text.match(/relacione|associe|conecte|ligaç/)) return 'Relação';

  return 'Conceito';
};

// Função para determinar dificuldade baseada no conteúdo
const determineDifficulty = (questao: Partial<Question>): keyof typeof DIFFICULTY_LEVELS => {
  // Primeiro, verifica se a dificuldade está explicitamente definida
  if (questao.dificuldade) {
    const diff = questao.dificuldade.toLowerCase();
    if (diff.includes('fácil') || diff.includes('facil') || diff.includes('easy')) return 'fácil';
    if (diff.includes('médio') || diff.includes('medio') || diff.includes('medium')) return 'médio';
    if (diff.includes('difícil') || diff.includes('dificil') || diff.includes('hard')) return 'difícil';
    if (diff.includes('extremo') || diff.includes('extreme') || diff.includes('expert')) return 'extremo';
  }

  const text = questao.enunciado?.toLowerCase() || '';
  let complexityScore = 0;

  // Fatores que aumentam a complexidade
  if (text.match(/calcul|resolv|determin|encontr|demonstr/)) complexityScore += 1;
  if (text.match(/gráfico|função|equação|sistema/)) complexityScore += 1;
  if (text.match(/anális|interpet|justific|explique/)) complexityScore += 1;
  if (text.match(/múltiplas etapas|várias|diversos|compare|relacione/)) complexityScore += 2;
  if (text.match(/derivada|integral|limite|matriz|logaritm/)) complexityScore += 3;

  // Baseado no tipo de questão
  if (questao.type === 'discursiva' || questao.type === 'dissertativa') complexityScore += 1;
  if (questao.alternativas && questao.alternativas.length > 4) complexityScore += 1;

  // Determina dificuldade final
  if (complexityScore <= 1) return 'fácil';
  if (complexityScore <= 3) return 'médio';
  if (complexityScore <= 5) return 'difícil';
  return 'extremo';
};

// Helper para obter a label de dificuldade
const getDifficultyLabel = (dificuldade?: string): string => {
  const level = determineDifficulty({ dificuldade });
  return DIFFICULTY_LEVELS[level].label;
};

interface Question {
  id: string;
  type: 'multipla-escolha' | 'discursiva' | 'verdadeiro-falso';
  enunciado?: string;
  alternativas?: string[];
  respostaCorreta?: number;
  explicacao?: string;
  dificuldade?: string;
  tema?: string;
  // Propriedades adicionais que podem vir da IA ou de outros fontes
  statement?: string;
  options?: string[];
  correctAnswer?: number | string;
  explanation?: string;
  difficulty?: string;
  topic?: string;
  pontos?: number;
  tempo_estimado?: string;
  tipo?: string;
  alternatives?: string[];
  question?: string;
  correct?: boolean;
  texto?: string;
  isCorrect?: boolean;
  response?: string;
  correct_answer?: number | string;
  gabarito?: number | string;
  criteriosAvaliacao?: string[];
  respostaEsperada?: string;
  resposta?: boolean | string | number;
}

interface ExerciseListData {
  titulo: string;
  disciplina: string;
  tema: string;
  tipoQuestoes: string;
  numeroQuestoes: number;
  dificuldade: string;
  objetivos: string;
  conteudoPrograma: string;
  observacoes?: string;
  questoes?: Question[];
  isGeneratedByAI?: boolean;
  generatedAt?: string;
  descricao?: string;
  anoEscolaridade?: string;
  nivelDificuldade?: string;
  tempoLimite?: string;
  questions?: Question[];
  content?: {
    questoes?: Question[];
    questions?: Question[];
  };
  subject?: string;
  theme?: string;
}

interface ExerciseListPreviewProps {
  data: ExerciseListData;
  customFields?: Record<string, any>;
  isGenerating?: boolean;
  onRegenerateContent?: () => void;
  onQuestionRender?: (questionId: string) => void;
  onQuestionSelect?: (questionIndex: number, questionId: string) => void;
}

const ExerciseListPreview: React.FC<ExerciseListPreviewProps> = ({
  data: activity,
  isGenerating = false,
  onRegenerateContent,
  onQuestionRender,
  onQuestionSelect
}) => {
  const [respostas, setRespostas] = useState<Record<string, string | number>>({});
  const [questoesExpandidas, setQuestoesExpandidas] = useState<Record<string, boolean>>({});
  const [explicacoesExpandidas, setExplicacoesExpandidas] = useState<Record<string, boolean>>({});
  const [questoesProcessadas, setQuestoesProcessadas] = useState<Question[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'detailed'>('grid');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [addQuestionTab, setAddQuestionTab] = useState<'school-power' | 'video' | 'material'>('school-power');
  const [newQuestionData, setNewQuestionData] = useState({
    descricao: '',
    modelo: '',
    dificuldade: ''
  });
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [exerciseData, setExerciseData] = useState<ExerciseListData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<{ index: number; id: string } | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [buildProgress, setBuildProgress] = useState<any>(null);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  const clearDeletedQuestionsCache = useCallback(() => {
    try {
      localStorage.removeItem(`deleted_questions_${activity?.id || 'current'}`);
      localStorage.removeItem(`activity_${activity?.id || 'current'}`);
      localStorage.removeItem(`original_activity_${activity?.id || 'current'}`);
      setDeletedQuestionIds(new Set());
      console.log('🧹 Cache de questões excluídas limpo');
    } catch (error) {
      console.warn('⚠️ Erro ao limpar cache:', error);
    }
  }, [activity?.id]);

  const toast = (options: { title: string; description: string; variant?: "destructive" | "default" | "secondary" | "outline" }) => {
    console.log(`Toast: ${options.title} - ${options.description} (${options.variant || 'default'})`);
  };

  const handleDeleteQuestion = useCallback((index: number, id: string) => {
    console.log(`🗑️ Iniciando exclusão da questão ${index + 1} (ID: ${id})`);
    setQuestionToDelete({ index, id });
    setShowDeleteModal(true);
  }, []);

  const cancelDeleteQuestion = useCallback(() => {
    console.log('❌ Exclusão cancelada pelo usuário');
    setQuestionToDelete(null);
    setShowDeleteModal(false);
  }, []);

  const confirmDeleteQuestion = useCallback(() => {
    if (!questionToDelete) return;

    console.log(`🗑️ Confirmando exclusão da questão ${questionToDelete.index + 1} (ID: ${questionToDelete.id})`);

    setDeletedQuestionIds(prev => {
      const newDeletedIds = new Set([...prev, questionToDelete.id]);
      console.log(`🗑️ IDs de questões excluídas atualizados:`, Array.from(newDeletedIds));
      try {
        localStorage.setItem(`deleted_questions_${activity?.id || 'current'}`, JSON.stringify(Array.from(newDeletedIds)));
        console.log(`💾 IDs de questões excluídas salvos no localStorage`);
      } catch (error) {
        console.warn('⚠️ Erro ao salvar IDs excluídos no localStorage:', error);
      }
      return newDeletedIds;
    });

    setQuestoesProcessadas(prevQuestoes => {
      const questoesFiltradas = prevQuestoes.filter(questao => questao.id !== questionToDelete.id);
      console.log(`✅ Questão ${questionToDelete.index + 1} excluída com sucesso. Total de questões restantes: ${questoesFiltradas.length}`);
      if (selectedQuestionIndex !== null) {
        if (selectedQuestionIndex >= questoesFiltradas.length) {
          const newIndex = questoesFiltradas.length > 0 ? Math.max(0, questoesFiltradas.length - 1) : null;
          console.log(`🔄 Ajustando selectedQuestionIndex de ${selectedQuestionIndex} para ${newIndex}`);
          setSelectedQuestionIndex(newIndex);
          if (questoesFiltradas.length === 0) {
            setViewMode('grid');
          }
        }
      }
      return questoesFiltradas;
    });

    if (exerciseData) {
      const updatedData = {
        ...exerciseData,
        questoes: exerciseData.questoes?.filter(questao => questao.id !== questionToDelete.id) || []
      };
      setExerciseData(updatedData);
      try {
        localStorage.setItem(`activity_${activity?.id || 'current'}`, JSON.stringify(updatedData));
        console.log(`💾 Dados da atividade atualizados salvos no localStorage após exclusão`);
      } catch (error) {
        console.warn('⚠️ Erro ao salvar dados atualizados no localStorage:', error);
      }
    }

    setShowDeleteModal(false);
    setQuestionToDelete(null);

    toast({
      title: "Questão excluída",
      description: `A Questão ${questionToDelete.index + 1} foi removida com sucesso.`,
      variant: "default"
    });
    console.log(`✅ Questão ${questionToDelete.index + 1} permanentemente excluída. ID: ${questionToDelete.id}`);
  }, [questionToDelete, selectedQuestionIndex, exerciseData, activity?.id]);

  const processQuestions = useCallback((activityData: any) => {
    if (!activityData) return null;

    console.log('🔄 Processando questões no ExerciseListPreview:', activityData);

    let questionsData = null;

    if (activityData?.content?.questoes && Array.isArray(activityData.content.questoes) && activityData.content.questoes.length > 0) {
      console.log('✅ Questões encontradas na IA (content.questoes):', activityData.content.questoes.length);
      questionsData = { ...activityData, questoes: activityData.content.questoes };
      questionsData.isGeneratedByAI = true;
    } else if (activityData?.content?.questions && Array.isArray(activityData.content.questions) && activityData.content.questions.length > 0) {
      console.log('✅ Questões encontradas na IA (content.questions):', activityData.content.questions.length);
      questionsData = { ...activityData, questoes: activityData.content.questions };
      questionsData.isGeneratedByAI = true;
    } else if (activityData?.questoes && Array.isArray(activityData.questoes) && activityData.questoes.length > 0) {
      console.log('✅ Questões encontradas diretamente (questoes):', activityData.questoes.length);
      questionsData = activityData;
      questionsData.isGeneratedByAI = activityData.isGeneratedByAI || false;
    } else if (activityData?.questions && Array.isArray(activityData.questions) && activityData.questions.length > 0) {
      console.log('✅ Questões encontradas diretamente (questions):', activityData.questions.length);
      questionsData = { ...activityData, questoes: activityData.questions };
      questionsData.isGeneratedByAI = activityData.isGeneratedByAI || false;
    } else {
      console.log('⚠️ Conteúdo de questões não encontrado, gerando questões simuladas como fallback');
      return null;
    }

    if (questionsData && questionsData.questoes) {
      console.log(`✨ Normalizando ${questionsData.questoes.length} questões.`);
      questionsData.questoes = questionsData.questoes.map((questao: any, index: number) => {
        const normalizedQuestion: Question = {
          id: questao.id || questao.statement_id || `questao-${index}-${Date.now()}`,
          type: (questao.type || questao.tipo || questao.question || 'multipla-escolha').toLowerCase().replace('_', '-').replace(' ', '-'),
          enunciado: questao.enunciado || questao.statement || questao.question || questao.title || `Questão ${index + 1}`,
          dificuldade: (questao.dificuldade || questao.difficulty || questao.nivel || 'medio').toLowerCase(),
          tema: questao.tema || questao.topic || questionsData?.tema || 'Tema não especificado',
          explicacao: questao.explicacao || questao.explanation || questao.detail || 'Sem explicação detalhada.',
          alternativas: questao.alternativas || questao.alternatives || questao.options,
          respostaCorreta: typeof questao.respostaCorreta === 'number' ? questao.respostaCorreta :
                           typeof questao.correctAnswer === 'number' ? questao.correctAnswer :
                           typeof questao.correct_answer === 'number' ? questao.correct_answer :
                           typeof questao.gabarito === 'number' ? questao.gabarito : 0,
          resposta: questao.resposta !== undefined ? questao.resposta : questao.texto,
          criteriosAvaliacao: questao.criteriosAvaliacao,
          respostaEsperada: questao.respostaEsperada,
          pontos: questao.pontos,
          tempo_estimado: questao.tempo_estimado,
        };

        const normalizedType = normalizedQuestion.type.toLowerCase().replace(/[\s_-]/g, '');
        if (normalizedType.includes('multipla') || normalizedType.includes('escolha') || normalizedType.includes('multiple') || normalizedType.includes('choice')) {
          normalizedQuestion.type = 'multipla-escolha';
        } else if (normalizedType.includes('verdadeiro') || normalizedType.includes('falso') || normalizedType.includes('true') || normalizedType.includes('false')) {
          normalizedQuestion.type = 'verdadeiro-falso';
          if (normalizedQuestion.respostaCorreta === undefined) {
            normalizedQuestion.respostaCorreta = 0;
          }
        } else if (normalizedType.includes('discursiva') || normalizedType.includes('dissertativa') || normalizedType.includes('essay')) {
          normalizedQuestion.type = 'discursiva';
          normalizedQuestion.alternativas = undefined;
          normalizedQuestion.respostaCorreta = undefined;
        } else {
          console.warn(`⚠️ Tipo de questão desconhecido: '${normalizedQuestion.type}'. Convertendo para 'multipla-escolha'.`);
          normalizedQuestion.type = 'multipla-escolha';
          if (!normalizedQuestion.alternativas || normalizedQuestion.alternativas.length < 2) {
            normalizedQuestion.alternativas = ['Opção A', 'Opção B', 'Opção C', 'Opção D'];
            normalizedQuestion.respostaCorreta = 0;
          }
        }
        return normalizedQuestion;
      });
    }
    return questionsData;
  }, []);

  useEffect(() => {
    if (!activity || isInitialized) return;

    console.log('🔄 Inicializando ExerciseListPreview com activity:', activity);

    let activityData = activity;
    try {
      const savedActivityData = localStorage.getItem(`activity_${activity?.id || 'current'}`);
      if (savedActivityData) {
        const parsedData = JSON.parse(savedActivityData);
        console.log('📱 Dados da atividade carregados do localStorage:', parsedData);
        activityData = parsedData;
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar dados da atividade do localStorage:', error);
    }

    try {
      const savedDeletedIds = localStorage.getItem(`deleted_questions_${activity?.id || 'current'}`);
      if (savedDeletedIds) {
        const deletedIds = JSON.parse(savedDeletedIds);
        console.log('🗑️ IDs de questões excluídas carregados do localStorage:', deletedIds);
        setDeletedQuestionIds(new Set(deletedIds));
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar IDs excluídos do localStorage:', error);
    }

    const processedData = processQuestions(activityData);
    if (processedData) {
      console.log('📝 Dados processados na inicialização:', processedData);
      setExerciseData(processedData);

      if (processedData?.questoes && Array.isArray(processedData.questoes)) {
        const questoesFiltradas = processedData.questoes.filter((questao: any) => !deletedQuestionIds.has(questao.id));
        console.log(`📋 Questões filtradas carregadas: ${questoesFiltradas.length} de ${processedData.questoes.length}`);
        setQuestoesProcessadas(questoesFiltradas);
      }
    }

    setIsInitialized(true);
  }, [activity, processQuestions, deletedQuestionIds, isInitialized]);

  useEffect(() => {
    if (deletedQuestionIds.size > 0 && exerciseData?.questoes) {
      console.log(`🗑️ Filtrando questões excluídas. IDs excluídos:`, Array.from(deletedQuestionIds));
      const questoesFiltradas = exerciseData.questoes.filter(questao => !deletedQuestionIds.has(questao.id));
      console.log(`✅ Questões filtradas. Total restante: ${questoesFiltradas.length}`);
      setQuestoesProcessadas(questoesFiltradas);

      if (selectedQuestionIndex !== null && selectedQuestionIndex >= questoesFiltradas.length) {
        const newIndex = questoesFiltradas.length > 0 ? Math.max(0, questoesFiltradas.length - 1) : null;
        console.log(`🔄 Ajustando selectedQuestionIndex de ${selectedQuestionIndex} para ${newIndex}`);
        setSelectedQuestionIndex(newIndex);
        if (questoesFiltradas.length === 0) {
          setViewMode('grid');
        }
      }
    }
  }, [deletedQuestionIds, exerciseData, selectedQuestionIndex]);

  const handleRespostaChange = useCallback((questaoId: string, resposta: string | number) => {
    setRespostas(prev => ({
      ...prev,
      [questaoId]: resposta
    }));
  }, []);

  const toggleQuestaoExpandida = useCallback((questaoId: string) => {
    setQuestoesExpandidas(prev => ({
      ...prev,
      [questaoId]: !prev[questaoId]
    }));
  }, []);

  const toggleExplicacaoExpandida = useCallback((questaoId: string) => {
    setExplicacoesExpandidas(prev => ({
      ...prev,
      [questaoId]: !prev[questaoId]
    }));
  }, []);

  const handleQuestionGridClick = useCallback((index: number, questaoId: string) => {
    console.log(`🎯 Clique no card da questão ${index + 1} (ID: ${questaoId})`);
    if (selectedQuestionIndex === index && viewMode === 'detailed') {
      console.log('🔄 Questão já selecionada, ignorando clique duplicado');
      return;
    }
    setSelectedQuestionIndex(index);
    setViewMode('detailed');
    if (onQuestionSelect) {
      onQuestionSelect(index, questaoId);
    }
    console.log(`✅ Questão ${index + 1} selecionada, mudando para view detailed`);
  }, [selectedQuestionIndex, viewMode, onQuestionSelect]);

  const handleSidebarQuestionClick = useCallback((index: number, questaoId: string) => {
    console.log(`📋 Clique na questão ${index + 1} do sidebar (ID: ${questaoId})`);
    setSelectedQuestionIndex(index);
    if (onQuestionSelect) {
      onQuestionSelect(index, questaoId);
    }
    console.log(`✅ Questão ${index + 1} selecionada no sidebar, mantendo view detailed`);
  }, [onQuestionSelect]);

  const handleBackToGrid = useCallback(() => {
    console.log('🔙 Voltando para a visualização em grade');
    setViewMode('grid');
    setSelectedQuestionIndex(null);
  }, []);

  const getDifficultyConfig = (dificuldade?: string) => {
    const nivel = determineDifficulty({ dificuldade });
    return DIFFICULTY_LEVELS[nivel];
  };

  const getTypeIcon = (type: Question['type']) => {
    switch (type) {
      case 'multipla-escolha': return <Circle className="w-4 h-4" />;
      case 'discursiva': return <Edit3 className="w-4 h-4" />;
      case 'verdadeiro-falso': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    if (onQuestionRender && questoesProcessadas.length > 0) {
      questoesProcessadas.forEach(questao => {
        onQuestionRender(questao.id);
      });
    }
  }, [questoesProcessadas, onQuestionRender]);

  const renderAddQuestionCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: questoesProcessadas.length * 0.05 }}
      className="relative cursor-pointer group"
      onClick={() => setShowAddQuestionModal(true)}
    >
      <Card className="h-52 hover:shadow-xl transition-all duration-300 border-2 border-orange-300/60 hover:border-orange-500/80 group-hover:scale-[1.02] bg-orange-50/30 dark:bg-orange-950/20 dark:border-orange-600/60 dark:hover:border-orange-500/60 rounded-2xl backdrop-blur-sm shadow-md">
        <CardContent className="p-5 h-full flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-orange-100 dark:bg-orange-900/40 mb-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/60 transition-colors">
            <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-2">Adicionar Questão</h3>
          <p className="text-sm text-orange-600 dark:text-orange-400 text-center leading-relaxed">
            Clique para criar uma nova questão personalizada
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderQuestionGridCard = (questao: Question, index: number) => {
    const difficultyConfig = getDifficultyConfig(questao.dificuldade);
    const questionTag = generateQuestionTag(questao.enunciado, questao.alternativas);

    return (
      <motion.div
        key={questao.id || `questao-${index + 1}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="relative cursor-pointer group"
        onClick={() => handleQuestionGridClick(index, questao.id)}
      >
        <Card className="h-52 hover:shadow-xl transition-all duration-300 border-2 border-gray-200/60 hover:border-orange-400/60 group-hover:scale-[1.02] bg-white/95 dark:bg-gray-800/90 dark:border-gray-600/60 dark:hover:border-orange-500/60 rounded-2xl backdrop-blur-sm shadow-md">
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white border-2 border-white/20">
              {index + 1}
            </div>
            <Badge className={`text-xs px-3 py-1 rounded-full shadow-md font-medium ${difficultyConfig.color} ${difficultyConfig.textColor} dark:opacity-95 border border-white/20`}>
              {difficultyConfig.label}
            </Badge>
          </div>

          <CardContent className="p-5 pt-16 h-full flex flex-col">
            <div className="flex-1">
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-4 leading-relaxed font-medium">
                {questao.enunciado?.substring(0, 130)}
                {questao.enunciado && questao.enunciado.length > 130 ? '...' : ''}
              </p>
            </div>

            <div className="space-y-3 mt-auto">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs px-3 py-1 rounded-lg bg-gray-50/80 dark:bg-gray-700/80 border-gray-300/50 dark:border-gray-600/50 text-gray-600 dark:text-gray-300 font-medium">
                  {getTypeIcon(questao.type)}
                  <span className="ml-1.5">
                    {questao.type === 'multipla-escolha' ? 'Múltipla Escolha' :
                     questao.type === 'verdadeiro-falso' ? 'V ou F' : 'Discursiva'}
                  </span>
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {questao.type === 'multipla-escolha' && questao.alternativas && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100/60 dark:bg-gray-700/60 px-2 py-1 rounded-md font-medium">
                      {questao.alternativas.length} alternativas
                    </span>
                  )}
                </div>
                <div className="w-2 h-2 rounded-full bg-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderQuestion = (questao: Question, index: number) => {
    const questionId = questao.id || `questao-${index + 1}`;
    const difficultyConfig = getDifficultyConfig(questao.dificuldade);
    const questionTag = generateQuestionTag(questao.enunciado, questao.alternativas);

    let alternativasProcessadas: string[] = [];
    if (questao.type === 'multipla-escolha') {
      if (questao.alternativas && Array.isArray(questao.alternativas) && questao.alternativas.length > 0) {
        alternativasProcessadas = questao.alternativas.map((alt, altIndex) => {
          if (typeof alt === 'string') return alt;
          if (alt && typeof alt === 'object' && alt.texto) return alt.texto;
          if (alt && typeof alt === 'object' && alt.text) return alt.text;
          if (alt && typeof alt === 'object' && alt.content) return alt.content;
          return `Alternativa ${String.fromCharCode(65 + altIndex)} Inválida`;
        });
      } else {
        alternativasProcessadas = ['Opção A', 'Opção B', 'Opção C', 'Opção D'];
      }
    } else if (questao.type === 'verdadeiro-falso') {
      alternativasProcessadas = ['Verdadeiro', 'Falso'];
    }

    console.log(`🔍 Renderizando Questão ${index + 1} - ID: ${questao.id}, Tipo: ${questao.type}`);

    return (
      <Card
        key={questionId}
        id={`question-${questionId}`}
        className="mb-4 border-l-4 border-l-orange-500 scroll-mt-4 dark:bg-gray-800 dark:border-l-orange-600"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className="text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                  Questão {index + 1}
                </Badge>
                <Badge className={`text-xs ${difficultyConfig.color} ${difficultyConfig.textColor} dark:opacity-90`}>
                  {difficultyConfig.label}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  {getTypeIcon(questao.type)}
                  <span>{questao.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
                <Badge variant="secondary" className="text-xs px-2 py-0.5 dark:bg-gray-700 dark:text-gray-300">
                  {questionTag}
                </Badge>
              </div>
              <CardTitle className="text-base font-medium leading-relaxed text-gray-900 dark:text-white">
                {questao.enunciado}
              </CardTitle>
            </div>

            <div className="flex-shrink-0 ml-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 rounded-full w-10 h-10 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-600 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(`🗑️ Botão de exclusão clicado para questão ${index + 1} (ID: ${questao.id})`);
                  handleDeleteQuestion(index, questao.id);
                }}
                title={`Excluir Questão ${index + 1}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {questao.type === 'multipla-escolha' && (
            <div className="space-y-3">
              {alternativasProcessadas.length > 0 ? (
                alternativasProcessadas.map((alternativa, altIndex) => {
                  const letter = String.fromCharCode(65 + altIndex);
                  const isSelected = respostas[questao.id] === altIndex;

                  return (
                    <div
                      key={altIndex}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-600 shadow-sm'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => handleRespostaChange(questao.id, altIndex)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                        isSelected
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                      }`}>
                        {letter}
                      </div>
                      <div className="flex-1 text-gray-800 dark:text-gray-200 leading-relaxed pt-1">
                        {alternativa}
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    ⚠️ Alternativas não encontradas para esta questão de múltipla escolha.
                  </p>
                </div>
              )}
            </div>
          )}

          {questao.type === 'verdadeiro-falso' && (
            <RadioGroup
              value={respostas[questao.id]?.toString() || ''}
              onValueChange={(value) => handleRespostaChange(questao.id, value === 'true' ? 0 : 1)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <RadioGroupItem value="true" id={`${questao.id}-true`} className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-orange-500 dark:text-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400" />
                <Label htmlFor={`${questao.id}-true`} className="flex-1 cursor-pointer font-normal text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 inline mr-2 text-green-600 dark:text-green-400" />
                  Verdadeiro
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <RadioGroupItem value="false" id={`${questao.id}-false`} className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-orange-500 dark:text-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400" />
                <Label htmlFor={`${questao.id}-false`} className="flex-1 cursor-pointer font-normal text-gray-700 dark:text-gray-300">
                  <Circle className="w-4 h-4 inline mr-2 text-red-600 dark:text-red-400" />
                  Falso
                </Label>
              </div>
            </RadioGroup>
          )}

          {questao.type === 'discursiva' && (
            <div className="space-y-3">
              <Textarea
                placeholder="Digite sua resposta aqui..."
                value={respostas[questao.id]?.toString() || ''}
                onChange={(e) => handleRespostaChange(questao.id, e.target.value)}
                className="min-h-[120px] resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Resposta: {respostas[questao.id]?.toString()?.length || 0} caracteres
              </div>
            </div>
          )}

          {questao.explicacao && (
            <div className="mt-4">
              <div
                className="p-3 bg-orange-50 dark:bg-orange-950/30 border-l-4 border-l-orange-400 dark:border-l-orange-600 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors rounded-lg"
                onClick={() => toggleExplicacaoExpandida(questao.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-orange-800 dark:text-orange-200">Explicação</div>
                  <div className="text-orange-600 dark:text-orange-400">
                    {explicacoesExpandidas[questao.id] ? '−' : '+'}
                  </div>
                </div>
                {explicacoesExpandidas[questao.id] && (
                  <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/30 border-l-4 border-orange-500 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-orange-900 dark:text-orange-100 flex items-center">
                        <Info className="w-4 h-4 mr-2" />
                        Detalhes da Explicação
                      </h4>
                    </div>
                    <div className="text-orange-800 dark:text-orange-200 whitespace-pre-wrap mb-4">
                      {questao.explicacao}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderQuestionsGrid = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {questoesProcessadas.map((questao, index) =>
          renderQuestionGridCard(questao, index)
        )}
        {renderAddQuestionCard()}
      </div>

      {exerciseData?.observacoes && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-yellow-950/30 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-yellow-200 mb-1">Observações Importantes</h4>
                <p className="text-amber-700 dark:text-yellow-300 text-sm">{exerciseData.observacoes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  const renderDetailedView = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex h-full"
    >
      <div className="absolute top-4 left-4 z-20">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBackToGrid}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border-orange-200 hover:bg-orange-50 text-orange-700 hover:text-orange-800"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar à Grade
        </Button>
      </div>

      <div className="w-72 bg-orange-50/30 border-r border-orange-200/50 overflow-y-auto dark:bg-gray-900 dark:border-gray-700 pt-16">
        <div className="p-2 space-y-2">
          {questoesProcessadas.map((questao, index) => {
            const difficultyConfig = getDifficultyConfig(questao.dificuldade);
            const questionTag = generateQuestionTag(questao.enunciado, questao.alternativas);
            const isSelected = selectedQuestionIndex === index;
            const isAnswered = respostas[questao.id] !== undefined && respostas[questao.id] !== null;

            return (
              <button
                key={questao.id || `questao-${index}`}
                onClick={() => handleSidebarQuestionClick(index, questao.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 border ${
                  isSelected
                    ? 'bg-orange-100/20 border-orange-300 border-2 backdrop-blur-sm dark:bg-orange-900/30 dark:border-orange-600'
                    : 'bg-transparent border border-gray-200/50 hover:bg-gray-50/30 backdrop-blur-sm dark:border-gray-700 dark:hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isAnswered
                      ? 'bg-green-500 text-white'
                      : isSelected
                        ? 'bg-orange-500 text-white'
                        : difficultyConfig.color + ' ' + difficultyConfig.textColor + ' dark:opacity-90'
                  }`}>
                    {isAnswered ? '✓' : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`font-medium text-sm ${difficultyConfig.textColor} dark:text-white`}>
                          {difficultyConfig.label}
                        </div>
                        <Badge variant="secondary" className="text-xs px-2 py-0.5 dark:bg-gray-700 dark:text-gray-300">
                          {questionTag}
                        </Badge>
                      </div>
                      <div className="flex-shrink-0">
                        {getTypeIcon(questao.type)}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 h-full overflow-y-auto pt-16">
        <div className="p-6">
          {selectedQuestionIndex !== null && questoesProcessadas[selectedQuestionIndex] ? (
            renderQuestion(questoesProcessadas[selectedQuestionIndex], selectedQuestionIndex)
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <FileText className="w-16 h-16 mb-4" />
              <p>Selecione uma questão no menu lateral para visualizá-la em detalhes.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-4 dark:text-gray-300">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <p className="text-gray-600 dark:text-gray-300 mt-3">Carregando lista de exercícios...</p>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {viewMode === 'grid' ? (
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            {renderQuestionsGrid()}
          </div>
        </div>
      ) : (
        renderDetailedView()
      )}

      <Dialog open={showAddQuestionModal} onOpenChange={setShowAddQuestionModal}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-orange-50 via-white to-orange-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-orange-950/20 border-orange-200/50 dark:border-orange-800/50 shadow-2xl">
          <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 px-8 py-6">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-4 left-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 right-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            </div>
            <div className="relative flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Wand2 className="w-5 h-5 text-white" />
                  </div>
                  Criar Nova Questão
                </DialogTitle>
                <p className="text-orange-100 text-sm">
                  Utilize a inteligência artificial do School Power para gerar questões personalizadas
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddQuestionModal(false)}
                className="h-10 w-10 p-0 hover:bg-white/20 text-white/80 hover:text-white rounded-full transition-all"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
            <div className="flex space-x-2 bg-gradient-to-r from-gray-50 to-orange-50/50 dark:from-gray-800 dark:to-orange-950/30 p-2 rounded-2xl mb-8 shadow-inner">
              <button
                onClick={() => setAddQuestionTab('school-power')}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  addQuestionTab === 'school-power'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 transform scale-[1.02]'
                    : 'text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Wand2 className="w-5 h-5" />
                <div className="text-left">
                  <div>School Power IA</div>
                  <div className="text-xs opacity-80">Geração inteligente</div>
                </div>
              </button>
              <button
                onClick={() => setAddQuestionTab('video')}
                disabled
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-sm font-semibold text-gray-400 dark:text-gray-500 cursor-not-allowed relative"
              >
                <Video className="w-5 h-5" />
                <div className="text-left">
                  <div>A partir de Vídeo</div>
                  <div className="text-xs opacity-80">Em breve</div>
                </div>
                <div className="absolute top-2 right-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded-full">
                  Soon
                </div>
              </button>
              <button
                onClick={() => setAddQuestionTab('material')}
                disabled
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-sm font-semibold text-gray-400 dark:text-gray-500 cursor-not-allowed relative"
              >
                <Material className="w-5 h-5" />
                <div className="text-left">
                  <div>A partir de Material</div>
                  <div className="text-xs opacity-80">Em breve</div>
                </div>
                <div className="absolute top-2 right-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded-full">
                  Soon
                </div>
              </button>
            </div>

            {addQuestionTab === 'school-power' && (
              <div className="space-y-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-orange-100 dark:border-orange-900/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                      <Edit3 className="w-4 h-4 text-white" />
                    </div>
                    <Label htmlFor="descricao" className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Descrição da Questão
                    </Label>
                  </div>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva detalhadamente o tema, conceitos ou conteúdo específico que você deseja abordar na questão. Seja específico para obter melhores resultados..."
                    value={newQuestionData.descricao}
                    onChange={(e) => setNewQuestionData(prev => ({ ...prev, descricao: e.target.value }))}
                    className="min-h-[120px] text-base resize-none border-orange-200 dark:border-orange-800 focus:border-orange-400 dark:focus:border-orange-600 focus:ring-orange-400/20"
                  />
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <span>Seja específico para obter melhores resultados</span>
                    <span>{newQuestionData.descricao.length}/500</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-orange-100 dark:border-orange-900/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                        <List className="w-4 h-4 text-white" />
                      </div>
                      <Label htmlFor="modelo" className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Tipo de Questão
                      </Label>
                    </div>
                    <Select value={newQuestionData.modelo} onValueChange={(value) => setNewQuestionData(prev => ({ ...prev, modelo: value }))}>
                      <SelectTrigger className="h-12 text-base border-orange-200 dark:border-orange-800 focus:border-orange-400 dark:focus:border-orange-600">
                        <SelectValue placeholder="Selecione o formato da questão" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-800">
                        <SelectItem value="Múltipla escolha" className="h-12 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Circle className="w-4 h-4 text-blue-500" />
                            <div>
                              <div className="font-medium">Múltipla Escolha</div>
                              <div className="text-xs text-gray-500">4 alternativas com uma correta</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Verdadeiro ou Falso" className="h-12 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <div>
                              <div className="font-medium">Verdadeiro ou Falso</div>
                              <div className="text-xs text-gray-500">Questão de confirmação binária</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Discursiva" className="h-12 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Edit3 className="w-4 h-4 text-purple-500" />
                            <div>
                              <div className="font-medium">Discursiva</div>
                              <div className="text-xs text-gray-500">Resposta elaborada pelo aluno</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-orange-100 dark:border-orange-900/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <Label htmlFor="dificuldade" className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Nível de Dificuldade
                      </Label>
                    </div>
                    <Select value={newQuestionData.dificuldade} onValueChange={(value) => setNewQuestionData(prev => ({ ...prev, dificuldade: value }))}>
                      <SelectTrigger className="h-12 text-base border-orange-200 dark:border-orange-800 focus:border-orange-400 dark:focus:border-orange-600">
                        <SelectValue placeholder="Defina o nível de complexidade" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-800">
                        <SelectItem value="Fácil" className="h-12 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <div>
                              <div className="font-medium">Fácil</div>
                              <div className="text-xs text-gray-500">Conceitos básicos e fundamentais</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Médio" className="h-12 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div>
                              <div className="font-medium">Médio</div>
                              <div className="text-xs text-gray-500">Aplicação e análise</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Difícil" className="h-12 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div>
                              <div className="font-medium">Difícil</div>
                              <div className="text-xs text-gray-500">Síntese e avaliação crítica</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Extremo" className="h-12 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-800"></div>
                            <div>
                              <div className="font-medium">Extremo</div>
                              <div className="text-xs text-gray-500">Máxima complexidade</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newQuestionData.descricao && newQuestionData.modelo && newQuestionData.dificuldade && (
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
                    <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Preview da Configuração
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-500 dark:text-gray-400">Tipo</div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">{newQuestionData.modelo}</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-500 dark:text-gray-400">Dificuldade</div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">{newQuestionData.dificuldade}</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-500 dark:text-gray-400">Caracteres</div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">{newQuestionData.descricao.length}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-6 border-t border-orange-100 dark:border-orange-900/30">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddQuestionModal(false);
                      setNewQuestionData({ descricao: '', modelo: '', dificuldade: '' });
                    }}
                    disabled={isGeneratingQuestion}
                    className="px-8 py-3 h-auto text-base border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => { /* generateQuestionWithAI() */ }} // Placeholder for actual function call
                    disabled={!newQuestionData.descricao || !newQuestionData.modelo || !newQuestionData.dificuldade || isGeneratingQuestion}
                    className="px-8 py-3 h-auto text-base bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingQuestion ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                        Gerando Questão...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-3" />
                        Criar Questão com IA
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {addQuestionTab === 'video' && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center">
                  <Video className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Criação a partir de Vídeo
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Esta funcionalidade permitirá gerar questões automaticamente a partir do conteúdo de vídeos educacionais. Em desenvolvimento.
                </p>
              </div>
            )}

            {addQuestionTab === 'material' && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 flex items-center justify-center">
                  <Material className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Criação a partir de Material
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Esta funcionalidade permitirá gerar questões automaticamente a partir de PDFs, documentos e outros materiais de estudo. Em desenvolvimento.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={(open) => {
        if (!open) {
          cancelDeleteQuestion();
        }
      }}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              Excluir Questão
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {questionToDelete && (
              <>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Tem certeza que deseja excluir a <strong>Questão {questionToDelete.index + 1}</strong>? 
                  Esta ação não pode ser desfeita.
                </p>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-800 dark:text-amber-200 text-sm">
                      A questão será removida permanentemente da lista de exercícios e esta alteração será salva.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={cancelDeleteQuestion}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmDeleteQuestion}
              className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Questão
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExerciseListPreview;
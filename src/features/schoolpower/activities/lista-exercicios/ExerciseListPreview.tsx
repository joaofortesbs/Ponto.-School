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
import { CheckCircle, Circle, Edit3, FileText, Clock, GraduationCap, BookOpen, Target, List, AlertCircle, RefreshCw, Hash, Zap, HelpCircle, Info, X, Wand2, BookOpen as Material, Video, Trash2, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

// Importações para drag and drop
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  const length = text.length;
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
  respostaCorreta?: number; // Índice da alternativa correta
  explicacao?: string;
  dificuldade?: string; // Pode ser 'facil', 'medio', 'dificil', 'extremo'
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
  tipo?: string; // Usado internamente para mapear para 'type'
  alternatives?: string[];
  question?: string; // Enunciado vindo de "question"
  correct?: boolean; // Para V/F, pode ser boolean
  texto?: string; // Para discursiva, pode ser a própria resposta
  isCorrect?: boolean; // Para V/F ou múltipla escolha, se foi respondida corretamente
  response?: string; // Resposta dada pelo usuário
  correct_answer?: number | string; // Outra forma de resposta correta
  gabarito?: number | string; // Outra forma de gabarito
  criteriosAvaliacao?: string[]; // Para questões discursivas
  respostaEsperada?: string; // Para questões discursivas
  resposta?: boolean | string | number; // Para V/F ou resposta discursiva
}

interface ExerciseListData {
  titulo: string;
  disciplina: string;
  tema: string;
  tipoQuestoes: string; // Pode ser 'misto', 'multipla-escolha', etc.
  numeroQuestoes: number;
  dificuldade: string; // Dificuldade geral da lista
  objetivos: string;
  conteudoPrograma: string;
  observacoes?: string;
  questoes?: Question[]; // Lista de questões no formato padrão
  isGeneratedByAI?: boolean;
  generatedAt?: string;
  descricao?: string; // Descrição da lista de exercícios
  anoEscolaridade?: string;
  nivelDificuldade?: string; // Similar a dificuldade, mas pode ter outra origem
  tempoLimite?: string;
  // Campos adicionais possivelmente presentes nos dados gerados pela IA
  questions?: Question[]; // Lista de questões em outro formato
  content?: {
    questoes?: Question[];
    questions?: Question[];
  };
  subject?: string; // Disciplina em outro formato
  theme?: string; // Tema em outro formato
}

interface ExerciseListPreviewProps {
  data: ExerciseListData; // Usar data como activity
  customFields?: Record<string, any>;
  isGenerating?: boolean;
  onRegenerateContent?: () => void;
  onQuestionRender?: (questionId: string) => void;
  onQuestionSelect?: (questionIndex: number, questionId: string) => void;
}

const ExerciseListPreview: React.FC<ExerciseListPreviewProps> = ({
  data: activity, // Renomeado para 'activity' para maior clareza com o context/API
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
    modelo: '', // Tipo de questão: 'Múltipla escolha', 'Verdadeiro ou Falso', 'Discursiva'
    dificuldade: '' // Nível de dificuldade: 'Fácil', 'Médio', 'Difícil', 'Extremo'
  });
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [exerciseData, setExerciseData] = useState<ExerciseListData | null>(null); // Estado para os dados processados
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<{ index: number; id: string } | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [buildProgress, setBuildProgress] = useState<any>(null);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedQuestion, setDraggedQuestion] = useState<Question | null>(null);

  // Configuração dos sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Função de toast funcional
  const toast = (options: { title: string; description: string; variant?: "destructive" | "default" | "secondary" | "outline" }) => {
    console.log(`Toast: ${options.title} - ${options.description} (${options.variant || 'default'})`);
    // Aqui você pode implementar uma notificação visual real se necessário
  };

  // Função para iniciar o processo de exclusão
  const handleDeleteQuestion = (index: number, id: string) => {
    console.log(`🗑️ Iniciando exclusão da questão ${index + 1} (ID: ${id})`);
    setQuestionToDelete({ index, id });
    setShowDeleteModal(true);
  };

  // Função para cancelar a exclusão
  const cancelDeleteQuestion = () => {
    console.log('❌ Exclusão cancelada pelo usuário');
    setQuestionToDelete(null);
    setShowDeleteModal(false);
  };

  // Função para confirmar e executar a exclusão
  const confirmDeleteQuestion = () => {
    if (!questionToDelete) return;

    console.log(`🗑️ Confirmando exclusão da questão ${questionToDelete.index + 1} (ID: ${questionToDelete.id})`);

    // Adiciona o ID da questão excluída ao estado
    setDeletedQuestionIds(prev => {
      const newDeletedIds = new Set([...prev, questionToDelete.id]);
      console.log(`🗑️ IDs de questões excluídas atualizados:`, Array.from(newDeletedIds));
      
      // Persistir as exclusões no localStorage de forma robusta
      try {
        const activityId = activity?.id || 'current';
        const deletedIdsArray = Array.from(newDeletedIds);
        
        // Salvar especificamente as questões excluídas
        localStorage.setItem(`activity_deleted_questions_${activityId}`, JSON.stringify(deletedIdsArray));
        console.log(`💾 IDs de questões excluídas salvos no localStorage:`, deletedIdsArray);
        
        // Atualizar dados da atividade também
        if (exerciseData) {
          const questoesFiltradas = exerciseData.questoes?.filter(questao => !newDeletedIds.has(questao.id)) || [];
          const updatedData = {
            ...exerciseData,
            questoes: questoesFiltradas,
            deletedQuestionIds: deletedIdsArray // Adicionar explicitamente os IDs excluídos
          };
          
          localStorage.setItem(`activity_${activityId}`, JSON.stringify(updatedData));
          setExerciseData(updatedData);
          console.log(`💾 Dados completos da atividade atualizados no localStorage`);
        }
      } catch (error) {
        console.warn('⚠️ Erro ao salvar exclusões no localStorage:', error);
      }
      
      return newDeletedIds;
    });

    // Remove imediatamente a questão da lista processada
    setQuestoesProcessadas(prevQuestoes => {
      const questoesFiltradas = prevQuestoes.filter(questao => questao.id !== questionToDelete.id);
      console.log(`✅ Questão ${questionToDelete.index + 1} excluída com sucesso. Total de questões restantes: ${questoesFiltradas.length}`);
      
      // Ajustar selectedQuestionIndex se necessário
      if (selectedQuestionIndex !== null) {
        if (selectedQuestionIndex >= questoesFiltradas.length) {
          const newIndex = questoesFiltradas.length > 0 ? Math.max(0, questoesFiltradas.length - 1) : null;
          console.log(`🔄 Ajustando selectedQuestionIndex de ${selectedQuestionIndex} para ${newIndex}`);
          setSelectedQuestionIndex(newIndex);
        }
      }
      
      return questoesFiltradas;
    });

    // Fecha o modal e limpa o estado
    setShowDeleteModal(false);
    setQuestionToDelete(null);

    // Mostra notificação de sucesso
    toast({
      title: "Questão excluída",
      description: `A Questão ${questionToDelete.index + 1} foi removida com sucesso.`,
      variant: "default"
    });

    console.log(`✅ Questão ${questionToDelete.index + 1} permanentemente excluída. ID: ${questionToDelete.id}`);
  };

  // Funções para drag and drop
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Encontrar a questão que está sendo arrastada
    const draggedQ = questoesProcessadas.find(q => q.id === active.id);
    setDraggedQuestion(draggedQ || null);
    
    console.log(`🔄 Iniciando drag da questão: ${active.id}`);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setQuestoesProcessadas((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        console.log(`🔄 Reordenando questões: movendo questão ${oldIndex + 1} para posição ${newIndex + 1}`);
        
        // Salvar nova ordem no localStorage
        try {
          const activityId = activity?.id || 'current';
          if (exerciseData) {
            const updatedData = {
              ...exerciseData,
              questoes: newOrder
            };
            localStorage.setItem(`activity_${activityId}`, JSON.stringify(updatedData));
            setExerciseData(updatedData);
            console.log(`💾 Nova ordem das questões salva no localStorage`);
          }
        } catch (error) {
          console.warn('⚠️ Erro ao salvar nova ordem no localStorage:', error);
        }

        // Ajustar selectedQuestionIndex se necessário
        if (selectedQuestionIndex !== null) {
          if (selectedQuestionIndex === oldIndex) {
            setSelectedQuestionIndex(newIndex);
          } else if (selectedQuestionIndex > oldIndex && selectedQuestionIndex <= newIndex) {
            setSelectedQuestionIndex(selectedQuestionIndex - 1);
          } else if (selectedQuestionIndex < oldIndex && selectedQuestionIndex >= newIndex) {
            setSelectedQuestionIndex(selectedQuestionIndex + 1);
          }
        }

        return newOrder;
      });
    }

    setActiveId(null);
    setDraggedQuestion(null);
  };

  // Função placeholder para 'generateActivity' caso não esteja definida
  const generateActivity = async (data: any) => {
    console.log("Simulando geração de atividade com dados:", data);
    return {
      ...data,
      questoes: Array.from({ length: data.numeroQuestoes || 3 }, (_, i) => ({
        id: `simulated-id-${i}-${Date.now()}`,
        enunciado: `Questão simulada ${i + 1} sobre ${data.tema || 'o tema'}`,
        type: 'multipla-escolha',
        alternativas: ['A', 'B', 'C', 'D'],
        respostaCorreta: i % 2,
        dificuldade: 'medio',
        explicacao: `Explicação para a questão simulada ${i + 1}.`,
        tema: data.tema || 'Tema Simulado'
      })),
      isGeneratedByAI: true,
      generatedAt: new Date().toISOString()
    };
  };


  const processQuestions = useCallback((activityData: any) => {
    console.log('🔄 Processando questões no ExerciseListPreview:', activityData);
    console.log('🔍 Estrutura completa dos dados:', JSON.stringify(activityData, null, 2));

    // Verificar se existe conteúdo gerado pela IA ou questões diretamente
    let questionsData = null;

    if (activityData?.content?.questoes && Array.isArray(activityData.content.questoes) && activityData.content.questoes.length > 0) {
      console.log('✅ Questões encontradas na IA (content.questoes):', activityData.content.questoes.length);
      questionsData = { ...activityData, questoes: activityData.content.questoes };
      questionsData.isGeneratedByAI = true; // Marcar como gerado por IA
    } else if (activityData?.content?.questions && Array.isArray(activityData.content.questions) && activityData.content.questions.length > 0) {
      console.log('✅ Questões encontradas na IA (content.questions):', activityData.content.questions.length);
      questionsData = { ...activityData, questoes: activityData.content.questions };
      questionsData.isGeneratedByAI = true; // Marcar como gerado por IA
    } else if (activityData?.questoes && Array.isArray(activityData.questoes) && activityData.questoes.length > 0) {
      console.log('✅ Questões encontradas diretamente (questoes):', activityData.questoes.length);
      questionsData = activityData;
      questionsData.isGeneratedByAI = activityData.isGeneratedByAI || false; // Manter se já estiver definido
    } else if (activityData?.questions && Array.isArray(activityData.questions) && activityData.questions.length > 0) {
      console.log('✅ Questões encontradas diretamente (questions):', activityData.questions.length);
      questionsData = { ...activityData, questoes: activityData.questions };
      questionsData.isGeneratedByAI = activityData.isGeneratedByAI || false;
    } else {
      console.log('⚠️ Conteúdo de questões não encontrado, gerando questões simuladas como fallback');

      // Fallback para questões simuladas
      const simulatedQuestions: Question[] = [];
      const numQuestions = activityData?.numeroQuestoes || 5; // Usar número de questões da atividade ou 5 como padrão

      for (let i = 1; i <= numQuestions; i++) {
        const questionTypes: Question['type'][] = ['multipla-escolha', 'discursiva', 'verdadeiro-falso'];
        // Cicla entre os tipos de questão disponíveis
        const questionType = questionTypes[(i - 1) % questionTypes.length];

        const baseQuestion: Question = {
          id: `simulated-questao-${i}`,
          type: questionType,
          enunciado: `Questão simulada ${i} sobre ${activityData?.tema || 'o tema geral'}.`,
          dificuldade: 'medio', // Dificuldade padrão
          tema: activityData?.tema || 'Tema não especificado'
        };

        if (questionType === 'multipla-escolha') {
          baseQuestion.alternativas = [
            `Alternativa A para a questão ${i}`,
            `Alternativa B para a questão ${i}`,
            `Alternativa C para a questão ${i}`,
            `Alternativa D para a questão ${i}`
          ];
          baseQuestion.respostaCorreta = 0; // Alternativa A como correta por padrão
          baseQuestion.explicacao = `Explicação para a questão ${i}: Esta é uma explicação simulada detalhando por que a alternativa A é a correta.`;
        } else if (questionType === 'verdadeiro-falso') {
          baseQuestion.resposta = true; // Verdadeiro como padrão
          baseQuestion.explicacao = `Explicação para a questão ${i}: Esta é uma explicação simulada para a afirmação.`;
        } else if (questionType === 'discursiva') {
          baseQuestion.criteriosAvaliacao = [
            "Estrutura coerente",
            "Argumentação clara",
            "Conhecimento do assunto"
          ];
          baseQuestion.respostaEsperada = `Resposta esperada para a questão ${i}: Um bom exemplo seria explicar o conceito X com detalhes.`;
        }

        simulatedQuestions.push(baseQuestion);
      }

      console.log(`✅ ${simulatedQuestions.length} questões simuladas geradas.`);

      questionsData = {
        titulo: activityData?.titulo || 'Lista de Exercícios Simulados',
        disciplina: activityData?.disciplina || 'Disciplina Simulada',
        tema: activityData?.tema || 'Tema Simulado',
        tipoQuestoes: 'misto', // Se gerou misto
        numeroQuestoes: numQuestions,
        dificuldade: activityData?.dificuldade || 'medio',
        objetivos: activityData?.objetivos || '',
        conteudoPrograma: activityData?.conteudoPrograma || '',
        observacoes: activityData?.observacoes || 'Estas são questões simuladas, pois o conteúdo original não foi encontrado.',
        questoes: simulatedQuestions,
        isGeneratedByAI: false, // Indica que não foi gerado por IA
        descricao: activityData?.descricao || 'Exercícios práticos simulados para demonstração.'
      };
    }

    // Processar e normalizar as questões encontradas ou simuladas
    if (questionsData && questionsData.questoes) {
      console.log(`✨ Normalizando ${questionsData.questoes.length} questões.`);
      questionsData.questoes = questionsData.questoes.map((questao: any, index: number) => {
        // Mapeamento de propriedades comuns
        const normalizedQuestion: Question = {
          id: questao.id || questao.statement_id || `questao-${index}-${Date.now()}`,
          type: (questao.type || questao.tipo || questao.question || 'multipla-escolha').toLowerCase().replace('_', '-').replace(' ', '-'),
          enunciado: questao.enunciado || questao.statement || questao.question || questao.title || `Questão ${index + 1} sobre ${questionsData?.tema || 'o tema'}`,
          dificuldade: (questao.dificuldade || questao.difficulty || questao.nivel || 'medio').toLowerCase(),
          tema: questao.tema || questao.topic || questionsData?.tema || 'Tema não especificado',
          explicacao: questao.explicacao || questao.explanation || questao.detail || 'Sem explicação detalhada.',
          // Mapeamento de alternativas e resposta correta
          alternativas: questao.alternativas || questao.alternatives || questao.options,
          respostaCorreta: typeof questao.respostaCorreta === 'number' ? questao.respostaCorreta :
                           typeof questao.correctAnswer === 'number' ? questao.correctAnswer :
                           typeof questao.correct_answer === 'number' ? questao.correct_answer :
                           typeof questao.gabarito === 'number' ? questao.gabarito :
                           typeof questao.respostaCorreta === 'string' && !isNaN(parseInt(questao.respostaCorreta)) ? parseInt(questao.respostaCorreta) :
                           typeof questao.correctAnswer === 'string' && !isNaN(parseInt(questao.correctAnswer)) ? parseInt(questao.correctAnswer) :
                           typeof questao.correct_answer === 'string' && !isNaN(parseInt(questao.correct_answer)) ? parseInt(questao.correct_answer) :
                           typeof questao.gabarito === 'string' && !isNaN(parseInt(questao.gabarito)) ? parseInt(questao.gabarito) :
                           (questao.type === 'verdadeiro-falso' || questao.type === 'true-false') ? (questao.resposta === true || questao.correct === true || questao.correct_answer === 'Verdadeiro' ? 0 : 1) :
                           (questao.type === 'discursiva' || questao.type === 'essay') ? undefined : 0, // Default para 0 se não especificado e for Múltipla Escolha
          // Mapeamento para questões V/F e Discursivas
          resposta: questao.resposta !== undefined ? questao.resposta : questao.texto,
          criteriosAvaliacao: questao.criteriosAvaliacao,
          respostaEsperada: questao.respostaEsperada,
          // Mapeamento de outros campos
          pontos: questao.pontos,
          tempo_estimado: questao.tempo_estimado,
        };

        // Normalização do tipo de questão para os 3 tipos permitidos
        const normalizedType = normalizedQuestion.type.toLowerCase().replace(/[\s_-]/g, '');
        if (normalizedType.includes('multipla') || normalizedType.includes('escolha') || normalizedType.includes('multiple') || normalizedType.includes('choice')) {
          normalizedQuestion.type = 'multipla-escolha';
        } else if (normalizedType.includes('verdadeiro') || normalizedType.includes('falso') || normalizedType.includes('true') || normalizedType.includes('false')) {
          normalizedQuestion.type = 'verdadeiro-falso';
          // Para V/F, garantir que a resposta correta seja 0 (Verdadeiro) ou 1 (Falso)
          if (normalizedQuestion.respostaCorreta === undefined) {
            if (questao.resposta === true || questao.correct === true || questao.correct_answer === 'Verdadeiro') normalizedQuestion.respostaCorreta = 0;
            else if (questao.resposta === false || questao.correct === false || questao.correct_answer === 'Falso') normalizedQuestion.respostaCorreta = 1;
            else if (questao.gabarito === 'Verdadeiro') normalizedQuestion.respostaCorreta = 0;
            else if (questao.gabarito === 'Falso') normalizedQuestion.respostaCorreta = 1;
            else normalizedQuestion.respostaCorreta = 0; // Default para Verdadeiro se não especificado
          }
        } else if (normalizedType.includes('discursiva') || normalizedType.includes('dissertativa') || normalizedType.includes('essay')) {
          normalizedQuestion.type = 'discursiva';
          normalizedQuestion.alternativas = undefined; // Discursiva não tem alternativas
          normalizedQuestion.respostaCorreta = undefined; // Discursiva não tem resposta correta como índice
        } else {
          console.warn(`⚠️ Tipo de questão desconhecido ou não suportado: '${normalizedQuestion.type}'. Convertendo para 'multipla-escolha'.`);
          normalizedQuestion.type = 'multipla-escolha';
          // Garantir que a múltipla escolha tenha um número razoável de alternativas
          if (!normalizedQuestion.alternativas || normalizedQuestion.alternativas.length < 2) {
            normalizedQuestion.alternativas = ['Opção A', 'Opção B', 'Opção C', 'Opção D'];
            normalizedQuestion.respostaCorreta = 0;
          }
        }

        // Garantir que a resposta correta seja um número para múltipla escolha e V/F
        if (normalizedQuestion.type === 'multipla-escolha' && normalizedQuestion.respostaCorreta !== undefined) {
          if (typeof normalizedQuestion.respostaCorreta === 'string' && !isNaN(parseInt(normalizedQuestion.respostaCorreta))) {
            normalizedQuestion.respostaCorreta = parseInt(normalizedQuestion.respostaCorreta);
          } else if (typeof normalizedQuestion.respostaCorreta !== 'number') {
            normalizedQuestion.respostaCorreta = 0; // Default se não for número válido
          }
        } else if (normalizedQuestion.type === 'verdadeiro-falso' && normalizedQuestion.respostaCorreta !== undefined) {
          if (typeof normalizedQuestion.respostaCorreta === 'string') {
            if (normalizedQuestion.respostaCorreta.toLowerCase() === 'verdadeiro') normalizedQuestion.respostaCorreta = 0;
            else if (normalizedQuestion.respostaCorreta.toLowerCase() === 'falso') normalizedQuestion.respostaCorreta = 1;
            else normalizedQuestion.respostaCorreta = 0; // Default
          } else if (typeof normalizedQuestion.respostaCorreta !== 'number') {
             normalizedQuestion.respostaCorreta = 0; // Default se não for número válido
          }
        }

        // Garantir que o enunciado não esteja vazio
        if (!normalizedQuestion.enunciado || normalizedQuestion.enunciado.trim() === '') {
          normalizedQuestion.enunciado = `Questão ${index + 1} (sem enunciado definido)`;
        }

        // Garantir que as alternativas sejam strings válidas para múltipla escolha
        if (normalizedQuestion.type === 'multipla-escolha' && normalizedQuestion.alternativas) {
          normalizedQuestion.alternativas = normalizedQuestion.alternativas.map((alt, altIndex) => {
            if (typeof alt === 'string') return alt;
            if (alt && typeof alt === 'object' && alt.texto) return alt.texto;
            if (alt && typeof alt === 'object' && alt.text) return alt.text;
            if (alt && typeof alt === 'object' && alt.content) return alt.content;
            return `Alternativa ${String.fromCharCode(65 + altIndex)} Inválida`;
          });
        }

        return normalizedQuestion;
      });
    }

    console.log('📊 Dados finais processados:', questionsData);
    return questionsData;
  }, []);

  // Efeito para processar os dados de 'activity' quando eles mudam
  useEffect(() => {
    console.log('🔄 UseEffect executado com activity:', activity);
    if (activity) {
      const processedData = processQuestions(activity);
      console.log('📝 Dados processados no useEffect:', processedData);
      setExerciseData(processedData);

      // Se tiver questões válidas, atualizar o estado `questoesProcessadas`
      if (processedData?.questoes && Array.isArray(processedData.questoes) && processedData.questoes.length > 0) {
        console.log(`📋 Atualizando lista de questões com ${processedData.questoes.length} itens.`);
        
        // Carregar questões excluídas do localStorage
        try {
          const activityId = activity.id || 'current';
          const deletedQuestionsJson = localStorage.getItem(`activity_deleted_questions_${activityId}`);
          
          if (deletedQuestionsJson) {
            const deletedQuestionIds = JSON.parse(deletedQuestionsJson);
            console.log(`🔍 Questões excluídas carregadas do localStorage:`, deletedQuestionIds);
            
            // Filtrar questões excluídas antes de definir o estado
            const questoesFiltradas = processedData.questoes.filter(questao => !deletedQuestionIds.includes(questao.id));
            console.log(`🗑️ Aplicando filtro de exclusões. ${processedData.questoes.length} questões originais -> ${questoesFiltradas.length} questões após filtro`);
            
            setQuestoesProcessadas(questoesFiltradas);
            setDeletedQuestionIds(new Set(deletedQuestionIds));
          } else {
            console.log('📋 Nenhuma exclusão encontrada no localStorage, carregando todas as questões');
            setQuestoesProcessadas(processedData.questoes);
            setDeletedQuestionIds(new Set());
          }
        } catch (error) {
          console.warn('⚠️ Erro ao carregar exclusões do localStorage:', error);
          setQuestoesProcessadas(processedData.questoes);
          setDeletedQuestionIds(new Set());
        }
      } else {
        console.log('🚫 Nenhuma questão válida encontrada para atualizar `questoesProcessadas`.');
        setQuestoesProcessadas([]); // Limpar se não houver questões
        setDeletedQuestionIds(new Set());
      }
    } else {
      console.log('ℹ️ `activity` está vazio ou indefinido, `questoesProcessadas` será limpo.');
      setQuestoesProcessadas([]);
      setExerciseData(null);
      setDeletedQuestionIds(new Set());
    }
  }, [activity, processQuestions]); // Dependência de processQuestions também

  // Efeito para ajustar selectedQuestionIndex quando questões são filtradas
  useEffect(() => {
    if (selectedQuestionIndex !== null && selectedQuestionIndex >= questoesProcessadas.length) {
      const newIndex = questoesProcessadas.length > 0 ? Math.max(0, questoesProcessadas.length - 1) : null;
      console.log(`🔄 Ajustando selectedQuestionIndex de ${selectedQuestionIndex} para ${newIndex} devido ao número de questões (${questoesProcessadas.length})`);
      setSelectedQuestionIndex(newIndex);
    }
  }, [questoesProcessadas.length, selectedQuestionIndex]);

  const handleRespostaChange = (questaoId: string, resposta: string | number) => {
    setRespostas(prev => ({
      ...prev,
      [questaoId]: resposta
    }));
  };

  const generateQuestionWithAI = async () => {
    if (!newQuestionData.descricao || !newQuestionData.modelo || !newQuestionData.dificuldade) {
      console.warn('❌ Dados incompletos para gerar questão:', newQuestionData);
      // Exibir um feedback ao usuário
      alert('Por favor, preencha a descrição, o tipo de questão e a dificuldade.');
      return;
    }

    console.log('🚀 Iniciando geração de questão com IA:', newQuestionData);
    setIsGeneratingQuestion(true);

    try {
      // Use uma chave API válida ou passe-a de forma segura (ex: via contexto ou env var)
      // Substitua 'SUA_API_KEY_AQUI' pela sua chave real
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'SUA_API_KEY_AQUI';
      if (apiKey === 'SUA_API_KEY_AQUI') {
        console.error('❌ Chave da API do Gemini não configurada. Verifique as variáveis de ambiente.');
        alert('Erro de configuração: Chave da API indisponível.');
        setIsGeneratingQuestion(false);
        return;
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

      // Determinar o tipo de questão para o prompt
      let questionTypeForPrompt = 'multipla-escolha';
      const modeloLower = newQuestionData.modelo.toLowerCase();
      if (modeloLower.includes('verdadeiro') || modeloLower.includes('falso')) {
        questionTypeForPrompt = 'verdadeiro-falso';
      } else if (modeloLower.includes('discursiva') || modeloLower.includes('dissertativa')) {
        questionTypeForPrompt = 'discursiva';
      }

      const disciplina = exerciseData?.disciplina || data?.subject || 'Matemática'; // Tenta obter de dados processados ou originais
      const tema = exerciseData?.tema || data?.theme || 'Conteúdo Geral'; // Tenta obter de dados processados ou originais

      // Construir o prompt
      const prompt = `
        Você é um assistente educacional বিশেষজ্ঞ em criar questões para o sistema School Power, focado no currículo brasileiro. Crie uma questão educacional REAL e ESPECÍFICA com base nas seguintes informações. Retorne APENAS a resposta em formato JSON, seguindo EXATAMENTE a estrutura abaixo.

        **Informações para a Questão:**
        - **Descrição/Tópico:** ${newQuestionData.descricao}
        - **Tipo de Questão Desejado:** ${newQuestionData.modelo}
        - **Nível de Dificuldade:** ${newQuestionData.dificuldade}
        - **Disciplina:** ${disciplina}
        - **Tema Central:** ${tema}

        **Instruções Críticas:**
        1.  **Realismo:** A questão deve ser pedagogicamente relevante e realista, não genérica.
        2.  **Especificidade:** Use o tópico fornecido para criar uma questão pontual.
        3.  **Formato JSON:** Responda APENAS com um objeto JSON válido. Sem texto introdutório ou conclusivo.
        4.  **Campos do JSON:** Use os campos definidos abaixo.

        **Estrutura JSON Esperada:**

        *   **Para Múltipla Escolha:**
            \`\`\`json
            {
              "id": "auto_generated_${Date.now()}",
              "type": "multipla-escolha",
              "enunciado": "Crie aqui um enunciado específico e claro...",
              "alternativas": [
                "Alternativa A plausível",
                "Alternativa B plausível",
                "Alternativa C plausível",
                "Alternativa D plausível"
              ],
              "respostaCorreta": 0, // Índice da alternativa correta (0 para A, 1 para B, etc.)
              "explicacao": "Explicação detalhada sobre a resposta correta e o porquê das incorretas.",
              "dificuldade": "${newQuestionData.dificuldade.toLowerCase()}",
              "tema": "${tema}"
            }
            \`\`\`

        *   **Para Verdadeiro ou Falso:**
            \`\`\`json
            {
              "id": "auto_generated_${Date.now()}",
              "type": "verdadeiro-falso",
              "enunciado": "Crie uma afirmação clara e objetiva para ser julgada como verdadeira ou falsa...",
              "alternativas": ["Verdadeiro", "Falso"],
              "respostaCorreta": 0, // 0 para Verdadeiro, 1 para Falso
              "explicacao": "Explicação detalhada sobre o porquê a afirmação é verdadeira ou falsa.",
              "dificuldade": "${newQuestionData.dificuldade.toLowerCase()}",
              "tema": "${tema}"
            }
            \`\`\`

        *   **Para Discursiva:**
            \`\`\`json
            {
              "id": "auto_generated_${Date.now()}",
              "type": "discursiva",
              "enunciado": "Formule uma pergunta dissertativa que exija análise, argumentação ou desenvolvimento de ideias...",
              "explicacao": "Critérios de avaliação e/ou pontos-chave esperados na resposta do aluno.",
              "dificuldade": "${newQuestionData.dificuldade.toLowerCase()}",
              "tema": "${tema}"
            }
            \`\`\`

        **Instrução Final:** Gere o JSON correspondente ao tipo de questão solicitado.
      `;

      console.log('📝 Enviando prompt para Gemini...');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`❌ Erro HTTP ${response.status}:`, errorData);
        throw new Error(`Erro na API do Gemini: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      console.log('📥 Resposta bruta do Gemini:', result);

      if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts) {
        const generatedText = result.candidates[0].content.parts[0].text;
        console.log('📝 Texto gerado pela IA:', generatedText);

        // Tentar extrair o JSON de forma robusta
        let jsonText = generatedText.trim();
        jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, ''); // Remove marcadores de código

        // Tentar encontrar o objeto JSON dentro do texto
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch && jsonMatch[0]) {
          jsonText = jsonMatch[0];
        } else {
          throw new Error('Não foi possível extrair um objeto JSON válido da resposta.');
        }

        console.log('🔍 JSON extraído para processamento:', jsonText);

        try {
          const novaQuestaoRaw = JSON.parse(jsonText);
          console.log('✅ Questão bruta gerada (parsed):', novaQuestaoRaw);

          // Processar e validar a questão gerada de acordo com nossa estrutura interna
          const novaQuestaoProcessada: Question = {
            id: novaQuestaoRaw.id || `auto_generated_${Date.now()}`,
            type: (novaQuestaoRaw.type || questionTypeForPrompt).toLowerCase().replace(/[\s_-]/g, ''),
            enunciado: novaQuestaoRaw.enunciado || novaQuestaoRaw.statement || `Questão gerada sobre ${newQuestionData.descricao}`,
            alternativas: novaQuestaoRaw.alternativas || novaQuestaoRaw.options,
            respostaCorreta: novaQuestaoRaw.respostaCorreta !== undefined ? novaQuestaoRaw.respostaCorreta : (novaQuestaoRaw.correctAnswer !== undefined ? novaQuestaoRaw.correctAnswer : (novaQuestaoRaw.correct_answer !== undefined ? novaQuestaoRaw.correct_answer : undefined)),
            explicacao: novaQuestaoRaw.explicacao || novaQuestaoRaw.explanation || 'Explicação não fornecida pela IA.',
            dificuldade: (novaQuestaoRaw.dificuldade || newQuestionData.dificuldade.toLowerCase()).toLowerCase(),
            tema: novaQuestaoRaw.tema || tema,
            criteriosAvaliacao: novaQuestaoRaw.criteriosAvaliacao,
            respostaEsperada: novaQuestaoRaw.respostaEsperada,
          };

          // Normalizar o tipo de questão para os 3 tipos permitidos
          const normalizedType = novaQuestaoProcessada.type.toLowerCase().replace(/[\s_-]/g, '');
          if (normalizedType.includes('multipla') || normalizedType.includes('escolha') || normalizedType.includes('multiple') || normalizedType.includes('choice')) {
            novaQuestaoProcessada.type = 'multipla-escolha';
          } else if (normalizedType.includes('verdadeiro') || normalizedType.includes('falso') || normalizedType.includes('true') || normalizedType.includes('false')) {
            novaQuestaoProcessada.type = 'verdadeiro-falso';
            // Garantir que a resposta correta seja 0 ou 1
            if (novaQuestaoProcessada.respostaCorreta !== undefined) {
                if (typeof novaQuestaoProcessada.respostaCorreta === 'string') {
                    if (novaQuestaoProcessada.respostaCorreta.toLowerCase() === 'verdadeiro') novaQuestaoProcessada.respostaCorreta = 0;
                    else if (novaQuestaoProcessada.respostaCorreta.toLowerCase() === 'falso') novaQuestaoProcessada.respostaCorreta = 1;
                    else novaQuestaoProcessada.respostaCorreta = 0; // Default
                } else if (typeof novaQuestaoProcessada.respostaCorreta !== 'number') {
                    novaQuestaoProcessada.respostaCorreta = 0; // Default
                }
            } else {
                novaQuestaoProcessada.respostaCorreta = 0; // Default para Verdadeiro se não especificado
            }
          } else if (normalizedType.includes('discursiva') || normalizedType.includes('dissertativa') || normalizedType.includes('essay')) {
            novaQuestaoProcessada.type = 'discursiva';
            novaQuestaoProcessada.alternativas = undefined;
            novaQuestaoProcessada.respostaCorreta = undefined;
          } else {
            novaQuestaoProcessada.type = 'multipla-escolha'; // Fallback
            if (!novaQuestaoProcessada.alternativas || novaQuestaoProcessada.alternativas.length < 2) {
              novaQuestaoProcessada.alternativas = ['Opção A', 'Opção B', 'Opção C', 'Opção D'];
              novaQuestaoProcessada.respostaCorreta = 0;
            }
          }

          // Validar campos essenciais
          if (!novaQuestaoProcessada.enunciado || novaQuestaoProcessada.enunciado.trim() === '') {
            throw new Error('Enunciado da questão gerada está vazio.');
          }
          if (novaQuestaoProcessada.type === 'multipla-escolha' && (!novaQuestaoProcessada.alternativas || novaQuestaoProcessada.alternativas.length < 2)) {
             throw new Error('Questão de múltipla escolha gerada sem alternativas suficientes.');
          }

          console.log('🎯 Questão processada e validada:', novaQuestaoProcessada);

          // Adicionar a nova questão à lista e atualizar o estado
          setQuestoesProcessadas(prev => {
            const updatedQuestions = [...prev, novaQuestaoProcessada];
            console.log('📋 Questões atualizadas:', updatedQuestions);
            return updatedQuestions;
          });

          // Fechar modal e limpar dados de entrada
          setShowAddQuestionModal(false);
          setNewQuestionData({ descricao: '', modelo: '', dificuldade: '' });

          console.log('🎉 Questão adicionada com sucesso!');

        } catch (parseError) {
          console.error('❌ Erro ao fazer parse do JSON da resposta da IA:', parseError);
          console.error('📄 JSON problemático recebido:', jsonText);
          // Tentar criar uma questão de fallback estruturada
          throw new Error('Falha ao processar a resposta da IA.');
        }
      } else {
        throw new Error('Resposta inválida ou incompleta da IA.');
      }
    } catch (error: any) {
      console.error('❌ Erro ao gerar questão com IA:', error);
      alert(`Ocorreu um erro ao gerar a questão: ${error.message}. Por favor, tente novamente.`);

      // Em caso de erro, criar uma questão de fallback estruturada localmente
      const modeloLower = newQuestionData.modelo.toLowerCase();
      let tipoFallback: Question['type'] = 'multipla-escolha';
      let alternativasFallback: string[] | undefined = ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'];

      if (modeloLower.includes('verdadeiro') || modeloLower.includes('falso')) {
        tipoFallback = 'verdadeiro-falso';
        alternativasFallback = ['Verdadeiro', 'Falso'];
      } else if (modeloLower.includes('discursiva') || modeloLower.includes('dissertativa')) {
        tipoFallback = 'discursiva';
        alternativasFallback = undefined;
      }

      const fallbackQuestion: Question = {
        id: `fallback-questao-${Date.now()}`,
        type: tipoFallback,
        enunciado: `Questão de fallback sobre: ${newQuestionData.descricao} (${exerciseData?.tema || 'Tema geral'})`,
        alternativas: alternativasFallback,
        respostaCorreta: tipoFallback === 'multipla-escolha' ? 0 : (tipoFallback === 'verdadeiro-falso' ? 0 : undefined),
        explicacao: 'Esta questão foi gerada localmente devido a um erro na comunicação com a IA. Por favor, revise o conteúdo.',
        dificuldade: newQuestionData.dificuldade.toLowerCase() || 'medio',
        tema: exerciseData?.tema || 'Tema geral'
      };

      setQuestoesProcessadas(prev => [...prev, fallbackQuestion]);
      setShowAddQuestionModal(false);
      setNewQuestionData({ descricao: '', modelo: '', dificuldade: '' });
      console.log('🔄 Questão fallback criada devido a erro:', fallbackQuestion);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const toggleQuestaoExpandida = (questaoId: string) => {
    setQuestoesExpandidas(prev => ({
      ...prev,
      [questaoId]: !prev[questaoId]
    }));
  };

  const toggleExplicacaoExpandida = (questaoId: string) => {
    setExplicacoesExpandidas(prev => ({
      ...prev,
      [questaoId]: !prev[questaoId]
    }));
  };

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

  // Effect para notificar quando questões são renderizadas (útil para tracking)
  useEffect(() => {
    if (onQuestionRender && questoesProcessadas.length > 0) {
      questoesProcessadas.forEach(questao => {
        onQuestionRender(questao.id);
      });
    }
  }, [questoesProcessadas, onQuestionRender]);

  // Componente do card para adicionar nova questão (estilizado)
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

  // Componente SortableQuestionCard
  const SortableQuestionCard = ({ questao, index }: { questao: Question; index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: questao.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const difficultyConfig = getDifficultyConfig(questao.dificuldade);
    const questionTag = generateQuestionTag(questao.enunciado, questao.alternativas);

    return (
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="relative cursor-pointer group"
        {...attributes}
      >
        <Card className={`h-52 hover:shadow-xl transition-all duration-300 border-2 border-gray-200/60 hover:border-orange-400/60 group-hover:scale-[1.02] bg-white/95 dark:bg-gray-800/90 dark:border-gray-600/60 dark:hover:border-orange-500/60 rounded-2xl backdrop-blur-sm shadow-md ${isDragging ? 'shadow-2xl scale-105 border-orange-500' : ''}`}>
          <div className="absolute top-3 left-3 z-10">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white border-2 border-white/20">
              {index + 1}
            </div>
          </div>

          {/* Tag de dificuldade que se move no hover e mostra o grip */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10 transition-all duration-300 group-hover:right-8">
            <Badge className={`text-xs px-3 py-1 rounded-full shadow-md font-medium ${difficultyConfig.color} ${difficultyConfig.textColor} dark:opacity-95 border border-white/20 transition-all duration-300`}>
              {difficultyConfig.label}
            </Badge>
            
            {/* Drag Handle que aparece no hover */}
            <div 
              className="p-1 rounded bg-white/80 dark:bg-gray-700/80 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-grab active:cursor-grabbing"
              {...listeners}
            >
              <GripVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
          </div>

          <CardContent 
            className="p-5 pt-16 h-full flex flex-col"
            onClick={() => {
              if (!isDragging) {
                setSelectedQuestionIndex(index);
                setViewMode('detailed');
                if (onQuestionSelect) {
                  onQuestionSelect(index, questao.id);
                }
              }
            }}
          >
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

  // Componente do mini-card para grade inicial de questões (fallback para quando drag não está ativo)
  const renderQuestionGridCard = (questao: Question, index: number) => {
    return <SortableQuestionCard questao={questao} index={index} />;
  };

  // Componente da grade de questões
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
        alternativasProcessadas = ['Opção A', 'Opção B', 'Opção C', 'Opção D']; // Fallback
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

            {/* Botão de Excluir Questão */}
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
                  const letter = String.fromCharCode(65 + altIndex); // A, B, C, D...
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
              onValueChange={(value) => handleRespostaChange(questao.id, value === 'true' ? 0 : 1)} // Converte 'true'/'false' para 0/1
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

                    {questao.gabarito !== undefined && (
                      <div className="pt-4 border-t border-orange-200 dark:border-orange-700">
                        <h5 className="font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Gabarito
                        </h5>
                        <div className="text-orange-800 dark:text-orange-200 font-medium">
                          {questao.type === 'multipla-escolha' ? (
                            typeof questao.gabarito === 'number' ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                Alternativa {String.fromCharCode(65 + questao.gabarito)}
                              </span>
                            ) : (
                              <span className="text-red-500">{`Gabarito inválido (tipo: ${typeof questao.gabarito})`}</span>
                            )
                          ) : questao.type === 'verdadeiro-falso' ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                              {questao.gabarito === 0 || questao.gabarito === 'Verdadeiro' ? 'Verdadeiro' : 'Falso'}
                            </span>
                          ) : (
                            <div className="text-sm whitespace-pre-wrap">
                              {String(questao.gabarito)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };


  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-4 dark:text-gray-300">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <p className="text-gray-600 dark:text-gray-300 mt-3">Carregando lista de exercícios...</p>
      </div>
    );
  }

  // Filtrar questões não excluídas para renderização
  const questoesParaRenderizar = questoesProcessadas.filter(questao => !deletedQuestionIds.has(questao.id));

  // Renderizar o conteúdo da grade de questões
  const renderQuestionsGridContent = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={questoesParaRenderizar.map(q => q.id)} 
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {questoesParaRenderizar.map((questao, index) =>
              renderQuestionGridCard(questao, index)
            )}
            {renderAddQuestionCard()}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId && draggedQuestion ? (
            <Card className="h-52 shadow-2xl border-2 border-orange-500 bg-white/95 dark:bg-gray-800/90 rounded-2xl backdrop-blur-sm transform rotate-3 scale-105">
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white border-2 border-white/20">
                  {questoesParaRenderizar.findIndex(q => q.id === activeId) + 1}
                </div>
                <Badge className={`text-xs px-3 py-1 rounded-full shadow-md font-medium ${getDifficultyConfig(draggedQuestion.dificuldade).color} ${getDifficultyConfig(draggedQuestion.dificuldade).textColor} dark:opacity-95 border border-white/20`}>
                  {getDifficultyConfig(draggedQuestion.dificuldade).label}
                </Badge>
              </div>
              <CardContent className="p-5 pt-16 h-full flex flex-col">
                <div className="flex-1">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-4 leading-relaxed font-medium">
                    {draggedQuestion.enunciado?.substring(0, 130)}
                    {draggedQuestion.enunciado && draggedQuestion.enunciado.length > 130 ? '...' : ''}
                  </p>
                </div>
                <div className="space-y-3 mt-auto">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs px-3 py-1 rounded-lg bg-gray-50/80 dark:bg-gray-700/80 border-gray-300/50 dark:border-gray-600/50 text-gray-600 dark:text-gray-300 font-medium">
                      {getTypeIcon(draggedQuestion.type)}
                      <span className="ml-1.5">
                        {draggedQuestion.type === 'multipla-escolha' ? 'Múltipla Escolha' :
                         draggedQuestion.type === 'verdadeiro-falso' ? 'V ou F' : 'Discursiva'}
                      </span>
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

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

  // Renderizar o conteúdo detalhado da questão
  const renderDetailedView = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex h-full"
    >
      <div className="w-72 bg-orange-50/30 border-r border-orange-200/50 overflow-y-auto dark:bg-gray-900 dark:border-gray-700">
        <div className="p-2 space-y-2">
          {questoesParaRenderizar.map((questao, index) => {
            const difficultyConfig = getDifficultyConfig(questao.dificuldade);
            const questionTag = generateQuestionTag(questao.enunciado, questao.alternativas);
            const isSelected = selectedQuestionIndex === index;
            const isAnswered = respostas[questao.id] !== undefined && respostas[questao.id] !== null; // Verifica se a resposta foi dada

            const getQuestionTypeIcon = (type: Question['type']) => {
              switch (type) {
                case 'multipla-escolha': return <Circle className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
                case 'discursiva': return <Edit3 className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
                case 'verdadeiro-falso': return <CheckCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
                default: return <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
              }
            };

            return (
              <button
                key={questao.id || `questao-${index}`}
                onClick={() => {
                  setSelectedQuestionIndex(index);
                  if (onQuestionSelect) {
                    onQuestionSelect(index, questao.id);
                  }
                }}
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
                        {getQuestionTypeIcon(questao.type)}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 h-full overflow-y-auto">
        <div className="p-6">
          {selectedQuestionIndex !== null && questoesParaRenderizar[selectedQuestionIndex] ? (
            renderQuestion(questoesParaRenderizar[selectedQuestionIndex], selectedQuestionIndex)
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

  return (
    <div className="h-full">
      {viewMode === 'grid' ? (
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            {renderQuestionsGridContent()}
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
                    onClick={generateQuestionWithAI}
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

      {/* Modal de Confirmação de Exclusão */}
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

      {/* Modal de Progresso da Construção Automática */}
      {showProgressModal && buildProgress && (
        <Dialog open={showProgressModal} onOpenChange={setShowProgressModal}>
          <DialogContent className="max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
                Construindo Questões...
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Aguarde enquanto as questões são geradas automaticamente.
              </p>
              {/* Aqui você pode adicionar um indicador de progresso mais visual, se buildProgress tiver dados */}
              {buildProgress && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Progresso: {JSON.stringify(buildProgress)}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setShowProgressModal(false)} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Placeholder para QuestionRenderer, caso não esteja definido em outro lugar
// Se QuestionRenderer já existe em um arquivo separado, esta definição pode ser removida
// ou ajustada para importação.
interface QuestionRendererProps {
  question: Question;
  questionNumber: number;
  showAnswers: boolean;
  onDelete: () => void;
  onEdit: (field: string, value: any) => void;
  isEditing: boolean;
  editingField: string | null;
  tempValues: { [key: string]: any };
  onSave: () => void;
  onCancel: () => void;
  onTempValueChange: (field: string, value: any) => void;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  questionNumber,
  showAnswers,
  onDelete,
  onEdit,
  isEditing,
  editingField,
  tempValues,
  onSave,
  onCancel,
  onTempValueChange
}) => {
  const difficultyConfig = determineDifficulty({ dificuldade: question.dificuldade });
  const questionTag = generateQuestionTag(question.enunciado, question.alternativas);

  const handleInputChange = (field: string, value: string | string[]) => {
    onTempValueChange(field, value);
  };

  return (
    <Card className="mb-4 border-l-4 border-l-orange-500 scroll-mt-4 dark:bg-gray-800 dark:border-l-orange-600 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className="text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                Questão {questionNumber}
              </Badge>
              <Badge className={`text-xs ${DIFFICULTY_LEVELS[difficultyConfig].color} ${DIFFICULTY_LEVELS[difficultyConfig].textColor} dark:opacity-90`}>
                {DIFFICULTY_LEVELS[difficultyConfig].label}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                {getTypeIcon(question.type)}
                <span>{question.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </div>
              <Badge variant="secondary" className="text-xs px-2 py-0.5 dark:bg-gray-700 dark:text-gray-300">
                {questionTag}
              </Badge>
            </div>
            <CardTitle className="text-base font-medium leading-relaxed text-gray-900 dark:text-white">
              {isEditing && editingField === 'enunciado' ? (
                <Textarea
                  value={tempValues['enunciado'] || question.enunciado}
                  onChange={(e) => handleInputChange('enunciado', e.target.value)}
                  className="min-h-[80px] resize-none text-base border-orange-200 dark:border-orange-800 focus:border-orange-400 dark:focus:border-orange-600 focus:ring-orange-400/20"
                />
              ) : (
                question.enunciado
              )}
            </CardTitle>
          </div>

          <div className="flex-shrink-0 ml-3 flex items-center gap-2">
            {!isEditing && (
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 rounded-full w-10 h-10 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-600 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                title={`Excluir Questão ${questionNumber}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}

            {isEditing ? (
              <>
                <Button variant="outline" onClick={onCancel} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full w-10 h-10">
                  <X className="w-4 h-4" />
                </Button>
                <Button onClick={onSave} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-10 h-10 shadow-md hover:shadow-lg transition-all duration-200">
                  <CheckCircle className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit('enunciado', question.enunciado);
                }}
                className="text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 rounded-full w-10 h-10 border border-gray-200 dark:border-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
                title={`Editar Questão ${questionNumber}`}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col">
        {question.type === 'multipla-escolha' && (
          <div className="space-y-3">
            {(question.alternativas || []).map((alternativa, altIndex) => {
              const letter = String.fromCharCode(65 + altIndex);
              const isCorrect = question.respostaCorreta === altIndex;
              const isSelected = false; // Lógica de seleção do usuário não implementada aqui

              return (
                <div
                  key={altIndex}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                    isEditing && editingField === `alternativa-${altIndex}` ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/30' :
                    'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                    isEditing && editingField === `alternativa-${altIndex}` ? 'bg-orange-500 text-white border-orange-500' :
                    isCorrect && showAnswers ? 'bg-green-500 text-white border-green-500' :
                    'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}>
                    {isEditing && editingField === `alternativa-${altIndex}` ? (
                      <Input
                        value={tempValues[`alternativa-${altIndex}`] || alternativa}
                        onChange={(e) => handleInputChange(`alternativa-${altIndex}`, e.target.value)}
                        className="h-7 w-7 p-0 text-center border-none focus:ring-0 focus:bg-orange-100"
                      />
                    ) : (
                      letter
                    )}
                  </div>
                  <div className="flex-1 text-gray-800 dark:text-gray-200 leading-relaxed pt-1">
                    {isEditing && editingField === `alternativa-${altIndex}` ? (
                      <Input
                        value={tempValues[`alternativa-${altIndex}`] || alternativa}
                        onChange={(e) => handleInputChange(`alternativa-${altIndex}`, e.target.value)}
                        className="h-8 p-0 border-none focus:ring-0 focus:bg-orange-100"
                      />
                    ) : (
                      alternativa
                    )}
                  </div>
                  {isCorrect && showAnswers && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {question.type === 'verdadeiro-falso' && (
          <div className="space-y-3">
            {['Verdadeiro', 'Falso'].map((label, index) => {
              const isCorrect = question.respostaCorreta === index;
              const isSelected = false; // Lógica de seleção do usuário não implementada aqui
              return (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    isEditing && editingField === 'resposta' ? (question.resposta === (index === 0) ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/30' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800') :
                    'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {isEditing && editingField === 'resposta' ? (
                    <RadioGroup
                      value={tempValues['resposta']?.toString() ?? ''}
                      onValueChange={(val) => handleInputChange('resposta', val === 'true' ? 0 : 1)}
                      className="flex items-center space-x-3"
                    >
                      <RadioGroupItem value={index === 0 ? 'true' : 'false'} id={`${question.id}-${index}`} className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-orange-500 focus:ring-orange-500" />
                      <Label htmlFor={`${question.id}-${index}`} className={`flex-1 font-normal cursor-pointer ${index === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {label}
                      </Label>
                    </RadioGroup>
                  ) : (
                    <>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                        isCorrect && showAnswers ? 'bg-green-500 text-white border-green-500' :
                        'bg-white dark:bg-gray-700 text-gray-600 dark:border-gray-600'
                      }`}>
                        {isCorrect && showAnswers ? <CheckCircle className="w-4 h-4" /> : label.startsWith('V') ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-red-500" />}
                      </div>
                      <Label htmlFor={`${question.id}-${index}`} className={`flex-1 font-normal cursor-pointer ${index === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {label}
                      </Label>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {question.type === 'discursiva' && (
          <div className="space-y-3 flex-1 flex flex-col">
            {isEditing && editingField === 'enunciado' ? (
              <></> // Enunciado já é tratado no CardHeader
            ) : (
              <Textarea
                placeholder="Digite sua resposta aqui..."
                value={isEditing && editingField === 'resposta' ? (tempValues['resposta'] || question.resposta) : question.resposta}
                onChange={(e) => isEditing && editingField === 'resposta' && handleInputChange('resposta', e.target.value)}
                readOnly={!isEditing || editingField !== 'resposta'}
                className="min-h-[120px] resize-none flex-1 border-orange-200 dark:border-orange-800 focus:border-orange-400 dark:focus:border-orange-600 focus:ring-orange-400/20 dark:bg-gray-800 dark:text-gray-300"
              />
            )}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-auto">
              Resposta: { (isEditing && editingField === 'resposta' ? tempValues['resposta'] : question.resposta)?.toString()?.length || 0 } caracteres
            </div>
          </div>
        )}

        {question.explicacao && (
          <div className="mt-4">
            <div
              className="p-3 bg-orange-50 dark:bg-orange-950/30 border-l-4 border-l-orange-400 dark:border-l-orange-600 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors rounded-lg"
              onClick={() => toggleExplicacaoExpandida(question.id)}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-orange-800 dark:text-orange-200">Explicação</div>
                <div className="text-orange-600 dark:text-orange-400">
                  {explicacoesExpandidas[question.id] ? '−' : '+'}
                </div>
              </div>
              {explicacoesExpandidas[question.id] && (
                <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/30 border-l-4 border-orange-500 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Detalhes da Explicação
                    </h4>
                  </div>
                  <div className="text-orange-800 dark:text-orange-200 whitespace-pre-wrap mb-4">
                    {isEditing && editingField === 'explicacao' ? (
                      <Textarea
                        value={tempValues['explicacao'] || question.explicacao}
                        onChange={(e) => handleInputChange('explicacao', e.target.value)}
                        className="min-h-[80px] resize-none text-base border-orange-200 dark:border-orange-800 focus:border-orange-400 dark:focus:border-orange-600 focus:ring-orange-400/20"
                      />
                    ) : (
                      question.explicacao
                    )}
                  </div>

                  {(question.respostaCorreta !== undefined || question.gabarito !== undefined) && (
                    <div className="pt-4 border-t border-orange-200 dark:border-orange-700">
                      <h5 className="font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Gabarito
                      </h5>
                      <div className="text-orange-800 dark:text-orange-200 font-medium">
                        {question.type === 'multipla-escolha' ? (
                          typeof question.respostaCorreta === 'number' ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                              Alternativa {String.fromCharCode(65 + question.respostaCorreta)}
                            </span>
                          ) : (
                            <span className="text-red-500">{`Gabarito inválido (tipo: ${typeof question.respostaCorreta})`}</span>
                          )
                        ) : question.type === 'verdadeiro-falso' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                            {question.respostaCorreta === 0 ? 'Verdadeiro' : 'Falso'}
                          </span>
                        ) : (
                          <div className="text-sm whitespace-pre-wrap">
                            {String(question.respostaCorreta)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExerciseListPreview;
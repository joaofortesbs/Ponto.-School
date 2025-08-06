
import React, { useState, useEffect } from 'react';
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
import { CheckCircle, Circle, Edit3, FileText, Clock, GraduationCap, BookOpen, Target, List, AlertCircle, RefreshCw, Hash, Zap, HelpCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
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
const determineDifficulty = (questao: any): keyof typeof DIFFICULTY_LEVELS => {
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

interface Question {
  id: string;
  type: 'multipla-escolha' | 'discursiva' | 'verdadeiro-falso';
  enunciado?: string;
  alternativas?: string[];
  respostaCorreta?: string | number;
  explicacao?: string;
  dificuldade?: 'facil' | 'medio' | 'dificil';
  tema?: string;
  // Propriedades adicionais que podem vir da IA
  statement?: string;
  options?: string[];
  correctAnswer?: string | number;
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
  correct_answer?: string;
  gabarito?: string | number; // Adicionado para o gabarito
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
  // Campos adicionais possivelmente presentes nos dados gerados pela IA
  questions?: Question[];
  content?: {
    questoes?: Question[];
    questions?: Question[];
  };
}

interface ExerciseListPreviewProps {
  data: ExerciseListData;
  customFields?: Record<string, any>;
  isGenerating?: boolean;
  onRegenerateContent?: () => void;
  onQuestionRender?: (questionId: string) => void;
  onQuestionSelect?: (questionIndex: number, questionId: string) => void;
}

// Componente para mini-card draggable
function SortableQuestionCard({ questao, index, onSelect }: { questao: Question; index: number; onSelect: () => void }) {
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
  };

  const difficulty = determineDifficulty(questao);
  const difficultyConfig = DIFFICULTY_LEVELS[difficulty];

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative cursor-grab active:cursor-grabbing group ${isDragging ? 'z-50' : ''}`}
      onClick={onSelect}
    >
      <Card className={`h-56 hover:shadow-2xl transition-all duration-300 border-2 ${isDragging ? 'border-orange-400 shadow-2xl scale-105' : 'border-orange-200/60 hover:border-orange-400/80'} group-hover:scale-[1.02] dark:bg-gray-800/95 dark:border-orange-600/60 dark:hover:border-orange-500/80 rounded-3xl backdrop-blur-sm bg-gradient-to-br from-white/95 to-orange-50/30 shadow-lg overflow-hidden`}>
        {/* Container para numeração e tag de dificuldade */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          {/* Numeração da questão */}
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white border-2 border-white/30 group-hover:from-orange-600 group-hover:to-orange-700 transition-all duration-300">
            {index + 1}
          </div>

          {/* Tag de dificuldade */}
          <Badge className={`text-xs px-3 py-1.5 rounded-full shadow-lg font-semibold ${difficultyConfig.color} ${difficultyConfig.textColor} dark:opacity-95 border border-white/30 backdrop-blur-sm`}>
            {difficultyConfig.label}
          </Badge>
        </div>

        <CardContent className="p-6 pt-20 h-full flex flex-col">
          <div className="flex-1">
            {/* Enunciado da questão (limitado) */}
            <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-3 mb-4 leading-relaxed font-medium">
              {questao.enunciado?.substring(0, 130)}
              {questao.enunciado && questao.enunciado.length > 130 ? '...' : ''}
            </p>
          </div>

          {/* Informações básicas na base do card */}
          <div className="space-y-3 mt-auto">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs px-3 py-1.5 rounded-xl bg-orange-50/80 dark:bg-orange-900/80 border-orange-300/50 dark:border-orange-600/50 text-orange-700 dark:text-orange-300 font-semibold backdrop-blur-sm">
                {questao.type === 'multipla-escolha' && <Circle className="w-3 h-3 mr-1.5" />}
                {questao.type === 'discursiva' && <Edit3 className="w-3 h-3 mr-1.5" />}
                {questao.type === 'verdadeiro-falso' && <CheckCircle className="w-3 h-3 mr-1.5" />}
                <span>
                  {questao.type === 'multipla-escolha' ? 'Múltipla Escolha' :
                   questao.type === 'verdadeiro-falso' ? 'V ou F' : 'Discursiva'}
                </span>
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {questao.type === 'multipla-escolha' && questao.alternativas && (
                  <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-100/80 dark:bg-orange-800/60 px-2.5 py-1 rounded-lg font-semibold backdrop-blur-sm">
                    {questao.alternativas.length} alternativas
                  </span>
                )}
              </div>

              {/* Indicador visual de hover */}
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"></div>
            </div>
          </div>

          {/* Indicador de drag */}
          {isDragging && (
            <div className="absolute inset-0 bg-orange-200/20 dark:bg-orange-900/20 rounded-3xl border-2 border-dashed border-orange-400 dark:border-orange-500"></div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

const ExerciseListPreview: React.FC<ExerciseListPreviewProps> = ({
  data,
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

  // Configuração do DnD Kit
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

  // Processar conteúdo gerado pela IA e extrair questões
  useEffect(() => {
    console.log('🔄 Processando questões no ExerciseListPreview:', data);
    console.log('🔍 Estrutura completa dos dados:', JSON.stringify(data, null, 2));

    // Verificar diferentes formatos de questões que podem vir da IA
    let questoesDaIA = null;
    let isContentFromAI = false;

    // Verificar se o conteúdo foi gerado pela IA
    if (data.isGeneratedByAI === true || data.generatedAt) {
      isContentFromAI = true;
      console.log('✅ Conteúdo confirmado como gerado pela IA');
    }

    // Buscar questões em diferentes possíveis localizações
    if (data.questoes && Array.isArray(data.questoes) && data.questoes.length > 0) {
      console.log(`✅ Questões encontradas em 'questoes': ${data.questoes.length}`);
      questoesDaIA = data.questoes;
    } else if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
      console.log(`✅ Questões encontradas em 'questions': ${data.questions.length}`);
      questoesDaIA = data.questions;
    } else if (data.content && data.content.questoes && Array.isArray(data.content.questoes)) {
      console.log(`✅ Questões encontradas em 'content.questoes': ${data.content.questoes.length}`);
      questoesDaIA = data.content.questoes;
    } else if (data.content && data.content.questions && Array.isArray(data.content.questions)) {
      console.log(`✅ Questões encontradas em 'content.questions': ${data.content.questions.length}`);
      questoesDaIA = data.content.questions;
    }

    if (questoesDaIA && questoesDaIA.length > 0) {
      console.log(`✅ Processando ${questoesDaIA.length} questões da IA`);
      console.log('📝 Primeira questão da IA:', questoesDaIA[0]);
      console.log('📝 Estrutura da primeira questão:', {
        hasId: !!questoesDaIA[0].id,
        hasType: !!questoesDaIA[0].type,
        hasEnunciado: !!questoesDaIA[0].enunciado,
        hasAlternativas: !!questoesDaIA[0].alternativas,
        alternativasLength: questoesDaIA[0].alternativas ? questoesDaIA[0].alternativas.length : 0
      });

      // Processar e validar as questões da IA
      const questoesProcessadasIA = questoesDaIA.map((questao, index) => {
        const questaoProcessada: Question = {
          id: questao.id || `questao-${index + 1}`,
          type: (questao.type || questao.tipo || questao.question || 'multipla-escolha').toLowerCase().replace('_', '-').replace(' ', '-'),
          enunciado: questao.enunciado || questao.enunciado || questao.statement || questao.question || `Questão ${index + 1}`,
          alternativas: questao.alternativas || questao.alternatives || questao.options,
          respostaCorreta: questao.respostaCorreta || questao.correctAnswer || questao.correct_answer || 0,
          explicacao: questao.explicacao || questao.explanation,
          dificuldade: (questao.dificuldade || questao.difficulty || 'medio').toLowerCase() as any, // Permitindo string temporariamente
          tema: questao.tema || questao.topic || data.tema || 'Tema não especificado',
          pontos: questao.pontos,
          tempo_estimado: questao.tempo_estimado,
          tipo: questao.tipo,
          gabarito: questao.gabarito || questao.respostaCorreta || questao.correctAnswer || questao.correct_answer // Inclui gabarito
        };

        // Ajuste de tipo para padronizar
        if (questaoProcessada.type === 'multipla_escolha' || questaoProcessada.type === 'multiple-choice' || questaoProcessada.type === 'múltipla escolha') {
          questaoProcessada.type = 'multipla-escolha';
          // Garantir que há alternativas suficientes
          if (!questaoProcessada.alternativas || questaoProcessada.alternativas.length < 2) {
            console.warn(`⚠️ Questão ${index + 1} sem alternativas suficientes, adicionando alternativas padrão`);
            questaoProcessada.alternativas = [
              'Opção A',
              'Opção B',
              'Opção C',
              'Opção D'
            ];
          }
        } else if (questaoProcessada.type === 'verdadeiro-falso' || questaoProcessada.type === 'true-false') {
          questaoProcessada.type = 'verdadeiro-falso';
          questaoProcessada.alternativas = ['Verdadeiro', 'Falso'];
        } else if (questaoProcessada.type === 'discursiva' || questaoProcessada.type === 'essay') {
          // Questões discursivas não precisam de alternativas
          questaoProcessada.alternativas = undefined;
        }

        console.log(`📄 Questão ${index + 1} processada:`, {
          id: questaoProcessada.id,
          type: questaoProcessada.type,
          enunciadoLength: questaoProcessada.enunciado?.length,
          hasAlternativas: !!questaoProcessada.alternativas,
          alternativasCount: questaoProcessada.alternativas ? questaoProcessada.alternativas.length : 0
        });

        return questaoProcessada;
      });

      console.log(`✅ ${questoesProcessadasIA.length} questões processadas com sucesso`);
      setQuestoesProcessadas(questoesProcessadasIA);

    } else if (isContentFromAI) {
      console.error('❌ Conteúdo marcado como da IA mas sem questões válidas');
      console.error('📊 Dados recebidos:', data);
      setQuestoesProcessadas([]);
    } else {
      console.log('⚠️ Conteúdo não foi gerado pela IA, usando questões simuladas como fallback');
      const questoesSimuladas = gerarQuestoesSimuladas(data);
      setQuestoesProcessadas(questoesSimuladas);
    }
  }, [data]);

  const gerarQuestoesSimuladas = (activityData: ExerciseListData): Question[] => {
    const questoes: Question[] = [];
    const tipos = (activityData.tipoQuestoes || 'multipla-escolha').toLowerCase();
    const numeroQuestoes = activityData.numeroQuestoes || 5;

    for (let i = 1; i <= numeroQuestoes; i++) {
      let tipoQuestao: Question['type'] = 'multipla-escolha';

      if (tipos.includes('mista')) {
        const tiposDisponiveis: Question['type'][] = ['multipla-escolha', 'discursiva', 'verdadeiro-falso'];
        tipoQuestao = tiposDisponiveis[Math.floor(Math.random() * tiposDisponiveis.length)];
      } else if (tipos.includes('discursiva')) {
        tipoQuestao = 'discursiva';
      } else if (tipos.includes('verdadeiro') || tipos.includes('falso')) {
        tipoQuestao = 'verdadeiro-falso';
      }

      questoes.push({
        id: `questao-${i}`,
        type: tipoQuestao,
        enunciado: `Questão ${i} sobre ${activityData.tema || activityData.disciplina || 'conteúdo geral'}`,
        alternativas: tipoQuestao === 'multipla-escolha' ? [
          'Alternativa A',
          'Alternativa B',
          'Alternativa C',
          'Alternativa D'
        ] : tipoQuestao === 'verdadeiro-falso' ? ['Verdadeiro', 'Falso'] : undefined,
        dificuldade: (activityData.dificuldade ? activityData.dificuldade.toLowerCase() : 'medio') as any,
        tema: activityData.tema || 'Tema não especificado'
      });
    }

    return questoes;
  };

  const handleRespostaChange = (questaoId: string, resposta: string | number) => {
    setRespostas(prev => ({
      ...prev,
      [questaoId]: resposta
    }));
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

  const getDifficultyColor = (dificuldade?: string) => {
    const nivel = determineDifficulty({ dificuldade: dificuldade }); // Usa a função de determinação
    const config = DIFFICULTY_LEVELS[nivel];
    return `${config.color} ${config.textColor}`;
  };

  const getTypeIcon = (type: Question['type']) => {
    switch (type) {
      case 'multipla-escolha': return <Circle className="w-4 h-4" />;
      case 'discursiva': return <Edit3 className="w-4 h-4" />;
      case 'verdadeiro-falso': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Effect para notificar quando questões são renderizadas
  useEffect(() => {
    if (onQuestionRender && questoesProcessadas.length > 0) {
      questoesProcessadas.forEach(questao => {
        onQuestionRender(questao.id);
      });
    }
  }, [questoesProcessadas, onQuestionRender]);

  // Função para lidar com o final do drag
  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setQuestoesProcessadas((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  // Componente da grade de questões
  const renderQuestionsGrid = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Grade de questões com DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={questoesProcessadas.map(q => q.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {questoesProcessadas.map((questao, index) => (
              <SortableQuestionCard
                key={questao.id}
                questao={questao}
                index={index}
                onSelect={() => {
                  setSelectedQuestionIndex(index);
                  setViewMode('detailed');
                  if (onQuestionSelect) {
                    onQuestionSelect(index, questao.id);
                  }
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Informações adicionais */}
      {consolidatedData.observacoes && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:bg-gradient-to-r dark:from-yellow-950/30 dark:to-orange-950/30 dark:border-yellow-800 rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 dark:text-yellow-200 mb-2">Observações Importantes</h4>
                <p className="text-amber-700 dark:text-yellow-300 leading-relaxed">{consolidatedData.observacoes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  const renderQuestion = (questao: Question, index: number) => {
    const questionId = questao.id || `questao-${index + 1}`;
    const difficulty = determineDifficulty(questao);
    const difficultyConfig = DIFFICULTY_LEVELS[difficulty];
    const questionTag = generateQuestionTag(questao.enunciado, questao.alternativas);

    // Extrair e processar alternativas de forma robusta
    let alternativasProcessadas = [];

    if (questao.type === 'multipla-escolha') {
      if (questao.alternativas && Array.isArray(questao.alternativas)) {
        alternativasProcessadas = questao.alternativas;
      } else if (questao.alternatives && Array.isArray(questao.alternatives)) {
        alternativasProcessadas = questao.alternatives;
      } else if (questao.options && Array.isArray(questao.options)) {
        alternativasProcessadas = questao.options;
      } else {
        // Fallback com alternativas padrão
        alternativasProcessadas = [
          'Opção A',
          'Opção B',
          'Opção C',
          'Opção D'
        ];
      }
    }

    console.log(`🔍 Questão ${index + 1} - Alternativas processadas:`, alternativasProcessadas);

    return (
      <Card
        key={questionId}
        id={`question-${questionId}`}
        className="mb-6 border-l-4 border-l-orange-500 scroll-mt-4 dark:bg-gray-800 dark:border-l-orange-600 rounded-2xl shadow-lg overflow-hidden"
      >
        <CardHeader className="pb-4 bg-gradient-to-r from-orange-50/50 to-white dark:from-orange-900/20 dark:to-gray-800">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="text-xs px-3 py-1.5 rounded-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 bg-orange-50 border-orange-200 text-orange-700 font-semibold">
                  Questão {index + 1}
                </Badge>
                <Badge className={`text-xs px-3 py-1.5 rounded-full font-semibold ${difficultyConfig.color} ${difficultyConfig.textColor} dark:opacity-95 shadow-sm`}>
                  {difficultyConfig.label}
                </Badge>
                <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-100/60 dark:bg-orange-900/40 px-2.5 py-1 rounded-full font-medium">
                  {getTypeIcon(questao.type)}
                  <span>{questao.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
                <Badge variant="secondary" className="text-xs px-3 py-1 rounded-full dark:bg-gray-700 dark:text-gray-300 bg-orange-100 text-orange-700 font-medium">
                  {questionTag}
                </Badge>
              </div>
              <CardTitle className="text-lg font-semibold leading-relaxed text-gray-900 dark:text-white">
                {questao.enunciado}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 p-6">
          {questao.type === 'multipla-escolha' && (
            <div className="space-y-4">
              {alternativasProcessadas.length > 0 ? (
                alternativasProcessadas.map((alternativa, altIndex) => {
                  const letter = String.fromCharCode(65 + altIndex); // A, B, C, D...
                  const isSelected = respostas[questao.id] === altIndex;

                  // Extrair texto da alternativa de forma robusta
                  let textoAlternativa = '';
                  if (typeof alternativa === 'string') {
                    textoAlternativa = alternativa;
                  } else if (alternativa && typeof alternativa === 'object') {
                    textoAlternativa = alternativa.texto || alternativa.text || alternativa.content || alternativa.label || JSON.stringify(alternativa);
                  } else {
                    textoAlternativa = `Alternativa ${letter}`;
                  }

                  return (
                    <div
                      key={altIndex}
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/30 border-orange-300 dark:border-orange-600 shadow-md'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-gray-50 dark:hover:from-gray-700/50 dark:hover:to-orange-900/20 hover:border-orange-200 dark:hover:border-orange-600'
                      }`}
                      onClick={() => handleRespostaChange(questao.id, altIndex)}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500 shadow-lg'
                          : 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30'
                      }`}>
                        {letter}
                      </div>
                      <div className="flex-1 text-gray-800 dark:text-gray-200 leading-relaxed pt-2 font-medium">
                        {textoAlternativa}
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-6 h-6 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-2" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    ⚠️ Alternativas não encontradas para esta questão de múltipla escolha.
                  </p>
                  <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                    {JSON.stringify(questao, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {questao.type === 'verdadeiro-falso' && (
            <RadioGroup
              value={respostas[questao.id]?.toString() || ''}
              onValueChange={(value) => handleRespostaChange(questao.id, value)}
              className="space-y-4"
            >
              <div className="flex items-center space-x-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-orange-50/30 dark:hover:bg-orange-900/20 hover:border-orange-200 dark:hover:border-orange-600 transition-all duration-300">
                <RadioGroupItem value="true" id={`${questao.id}-true`} className="border-orange-300 dark:border-orange-600 dark:bg-gray-700 text-orange-500 dark:text-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400" />
                <Label htmlFor={`${questao.id}-true`} className="flex-1 cursor-pointer font-medium text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 inline mr-3 text-green-600 dark:text-green-400" />
                  Verdadeiro
                </Label>
              </div>
              <div className="flex items-center space-x-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-orange-50/30 dark:hover:bg-orange-900/20 hover:border-orange-200 dark:hover:border-orange-600 transition-all duration-300">
                <RadioGroupItem value="false" id={`${questao.id}-false`} className="border-orange-300 dark:border-orange-600 dark:bg-gray-700 text-orange-500 dark:text-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400" />
                <Label htmlFor={`${questao.id}-false`} className="flex-1 cursor-pointer font-medium text-gray-700 dark:text-gray-300">
                  <Circle className="w-5 h-5 inline mr-3 text-red-600 dark:text-red-400" />
                  Falso
                </Label>
              </div>
            </RadioGroup>
          )}

          {questao.type === 'discursiva' && (
            <div className="space-y-4">
              <Textarea
                placeholder="Digite sua resposta aqui..."
                value={respostas[questao.id]?.toString() || ''}
                onChange={(e) => handleRespostaChange(questao.id, e.target.value)}
                className="min-h-[140px] resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 border-orange-200 focus:border-orange-400 focus:ring-orange-400 rounded-xl"
              />
              <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/20 px-3 py-2 rounded-lg">
                Resposta: {respostas[questao.id]?.toString()?.length || 0} caracteres
              </div>
            </div>
          )}

          {questao.explicacao && (
            <div className="mt-6">
              <div
                className="p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/30 border-l-4 border-l-orange-400 dark:border-l-orange-600 cursor-pointer hover:from-orange-100/70 hover:to-orange-50 dark:hover:from-orange-900/50 dark:hover:to-orange-950/40 transition-all duration-300 rounded-xl"
                onClick={() => toggleExplicacaoExpandida(questao.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-orange-800 dark:text-orange-200 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Explicação
                  </div>
                  <div className="text-orange-600 dark:text-orange-400 font-bold text-lg">
                    {explicacoesExpandidas[questao.id] ? '−' : '+'}
                  </div>
                </div>
                {explicacoesExpandidas[questao.id] && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-orange-50 to-white dark:from-orange-900/30 dark:to-gray-800 border-l-4 border-orange-500 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-orange-900 dark:text-orange-100 flex items-center text-lg">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Explicação Detalhada
                      </h4>
                    </div>
                    <div className="text-orange-800 dark:text-orange-200 whitespace-pre-wrap mb-6 leading-relaxed">
                      {questao.explicacao}
                    </div>

                    {/* Gabarito da Questão */}
                    {questao.gabarito && (
                      <div className="pt-4 border-t border-orange-200 dark:border-orange-700">
                        <h5 className="font-bold text-orange-900 dark:text-orange-100 mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Gabarito Oficial
                        </h5>
                        <div className="text-orange-800 dark:text-orange-200 font-semibold">
                          {questao.tipo === 'multipla-escolha' ? (
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-bold">
                              Alternativa {questao.gabarito}
                            </span>
                          ) : questao.tipo === 'verdadeiro-falso' ? (
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-bold">
                              {questao.gabarito === 'V' || questao.gabarito === 'Verdadeiro' ? 'Verdadeiro' : 'Falso'}
                            </span>
                          ) : (
                            <div className="text-sm whitespace-pre-wrap bg-green-50 dark:bg-green-900/30 p-4 rounded-xl border border-green-200 dark:border-green-700">
                              {questao.gabarito}
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
      <div className="flex flex-col items-center justify-center p-12 space-y-6 dark:text-gray-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Gerando lista de exercícios...</p>
      </div>
    );
  }

  const consolidatedData = {
    titulo: data?.titulo || 'Lista de Exercícios',
    disciplina: data?.disciplina || 'Disciplina não especificada',
    tema: data?.tema || 'Tema não especificado',
    tipoQuestoes: data?.tipoQuestoes || 'multipla-escolha',
    numeroQuestoes: data?.numeroQuestoes || 5,
    dificuldade: data?.dificuldade || 'medio',
    objetivos: data?.objetivos || '',
    conteudoPrograma: data?.conteudoPrograma || '',
    observacoes: data?.observacoes || '',
    questoes: data?.questoes || [],
    isGeneratedByAI: data?.isGeneratedByAI || false,
    generatedAt: data?.generatedAt,
    descricao: data?.descricao || 'Exercícios práticos para fixação do conteúdo',
    anoEscolaridade: data?.anoEscolaridade,
    nivelDificuldade: data?.nivelDificuldade,
    tempoLimite: data?.tempoLimite
  };

  console.log('📊 Dados consolidados finais:', consolidatedData);

  return (
    <div className="h-full">
      {viewMode === 'grid' ? (
        <div className="h-full flex flex-col">
          {/* Grade de questões */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderQuestionsGrid()}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex h-full"
        >
          {/* Menu lateral de navegação das questões */}
          <div className="w-80 bg-gradient-to-b from-orange-50 to-white border-r border-orange-200 overflow-y-auto dark:from-gray-900 dark:to-gray-800 dark:border-orange-700">
            <div className="p-4 space-y-3">
              {questoesProcessadas.map((questao, index) => {
                const difficulty = determineDifficulty(questao);
                const difficultyConfig = DIFFICULTY_LEVELS[difficulty];
                const questionTag = generateQuestionTag(questao.enunciado, questao.alternativas);
                const isSelected = selectedQuestionIndex === index;
                const isAnswered = respostas[questao.id] !== undefined;

                // Função para obter o ícone do tipo de questão
                const getQuestionTypeIcon = (type: Question['type']) => {
                  switch (type) {
                    case 'multipla-escolha':
                      return <Circle className="w-4 h-4 text-orange-500 dark:text-orange-400" />;
                    case 'discursiva':
                      return <Edit3 className="w-4 h-4 text-orange-500 dark:text-orange-400" />;
                    case 'verdadeiro-falso':
                      return <CheckCircle className="w-4 h-4 text-orange-500 dark:text-orange-400" />;
                    default:
                      return <FileText className="w-4 h-4 text-orange-500 dark:text-orange-400" />;
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
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border-2 ${
                      isSelected
                        ? 'bg-gradient-to-r from-orange-100/50 to-orange-200/30 border-orange-300 border-2 backdrop-blur-sm dark:from-orange-900/30 dark:to-orange-800/30 dark:border-orange-600 shadow-lg'
                        : 'bg-white/80 border-orange-200/50 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-white backdrop-blur-sm dark:border-orange-700 dark:hover:from-gray-800/50 dark:hover:to-orange-900/20 dark:bg-gray-800/80 hover:border-orange-300 dark:hover:border-orange-600'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-2xl flex items-center justify-center text-sm font-bold shadow-md ${
                        isAnswered
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                          : isSelected
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                            : difficultyConfig.color + ' ' + difficultyConfig.textColor + ' dark:opacity-90'
                      }`}>
                        {isAnswered ? '✓' : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`font-semibold text-sm ${difficultyConfig.textColor} dark:text-white`}>
                              {difficultyConfig.label}
                            </div>
                            <Badge variant="secondary" className="text-xs px-2 py-0.5 dark:bg-orange-700 dark:text-orange-300 bg-orange-100 text-orange-700 rounded-full">
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

          {/* Área principal com a questão selecionada */}
          <div className="flex-1 h-full overflow-y-auto">
            {/* Conteúdo da questão */}
            <div className="p-8 bg-gradient-to-b from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-950/20">
              {selectedQuestionIndex !== null && questoesProcessadas[selectedQuestionIndex] && (
                renderQuestion(questoesProcessadas[selectedQuestionIndex], selectedQuestionIndex)
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ExerciseListPreview;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowLeft, Grid, List, Eye, EyeOff, FileText, CheckCircle2, Clock, BookOpen, Target, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
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

  // Componente de mini-card para grade inicial de questões
  const renderQuestionGridCard = (questao: Question, index: number) => {
    const difficulty = determineDifficulty(questao);
    const difficultyConfig = DIFFICULTY_LEVELS[difficulty];
    return (
      <motion.div
        key={questao.id || `questao-${index + 1}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="relative cursor-pointer group"
        onClick={() => {
          setSelectedQuestionIndex(index);
          setViewMode('detailed');
          // Notificar o modal pai sobre a seleção da questão
          if (onQuestionSelect) {
            onQuestionSelect(index, questao.id);
          }
        }}
      >
        <Card className="h-52 hover:shadow-xl transition-all duration-300 border-2 border-gray-200/60 hover:border-blue-400/60 group-hover:scale-[1.02] dark:bg-gray-800/90 dark:border-gray-600/60 dark:hover:border-blue-500/60 rounded-2xl backdrop-blur-sm bg-white/95 shadow-md">
          {/* Container para numeração e tag de dificuldade */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            {/* Numeração da questão */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white border-2 border-white/20">
              {index + 1}
            </div>

            {/* Tag de dificuldade */}
            <Badge 
              variant="secondary" 
              className={`px-2 py-1 text-xs font-medium rounded-lg shadow-sm ${difficultyConfig.bgColor} ${difficultyConfig.textColor} ${difficultyConfig.borderColor} border`}
            >
              {difficultyConfig.label}
            </Badge>
          </div>

          <CardContent className="p-5 pt-16 h-full flex flex-col">
            <div className="flex-1">
              {/* Enunciado da questão (limitado) */}
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-4 leading-relaxed font-medium">
                {questao.enunciado?.substring(0, 130)}
                {questao.enunciado && questao.enunciado.length > 130 ? '...' : ''}
              </p>
            </div>

            {/* Informações básicas na base do card */}
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

                {/* Indicador visual de hover */}
                <div className="w-2 h-2 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Função para lidar com o drag end
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = questoesProcessadas.findIndex((item) => 
        (item.id || `questao-${questoesProcessadas.indexOf(item) + 1}`) === active.id
      );
      const newIndex = questoesProcessadas.findIndex((item) => 
        (item.id || `questao-${questoesProcessadas.indexOf(item) + 1}`) === over.id
      );

      // Reordenar as questões
      const newQuestoes = arrayMove(questoesProcessadas, oldIndex, newIndex);

      // Atualizar o estado das questões
      setQuestoesProcessadas(newQuestoes);
    }
  };

  // Sensors para drag and drop
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

  // Componente da grade de questões
  const renderQuestionsGrid = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header da grade */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
            Lista de Questões
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Clique em qualquer questão para visualizar os detalhes ou arraste para reordenar
          </p>
        </div>

        {/* Estatísticas da grade */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {questoesProcessadas.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Questões
            </div>
          </div>
        </div>
      </div>

      {/* Grade de mini-cards com drag-and-drop */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={questoesProcessadas.map((questao, index) => questao.id || `questao-${index + 1}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {questoesProcessadas.map((questao, index) => (
              <SortableQuestionCard key={questao.id || `questao-${index + 1}`} questao={questao} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </motion.div>
  );

  // Componente para a questão dentro do contexto de arrastar e soltar
  const SortableQuestionCard = ({ questao, index }: { questao: Question, index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: questao.id || `questao-${index + 1}` });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1,
    };

    const difficulty = determineDifficulty(questao);
    const difficultyConfig = DIFFICULTY_LEVELS[difficulty];

    return (
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="relative group cursor-grab active:cursor-grabbing"
        {...attributes}
      >
        <Card className="h-52 hover:shadow-xl transition-all duration-300 border-2 border-orange-200/60 hover:border-orange-400/60 group-hover:scale-[1.02] dark:bg-gray-800/90 dark:border-gray-600/60 dark:hover:border-orange-500/60 rounded-2xl backdrop-blur-sm bg-white/95 shadow-md">
          {/* Container para numeração, tag de dificuldade e handle de arrastar */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            {/* Numeração da questão */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white border-2 border-white/20">
              {index + 1}
            </div>

            {/* Handle de arrastar */}
            <div {...listeners} className="p-1 cursor-grab active:cursor-grabbing">
              <GripVertical className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>

            {/* Tag de dificuldade */}
            <Badge 
              variant="secondary" 
              className={`px-2 py-1 text-xs font-medium rounded-lg shadow-sm ${difficultyConfig.bgColor} ${difficultyConfig.textColor} ${difficultyConfig.borderColor} border`}
            >
              {difficultyConfig.label}
            </Badge>
          </div>

          <CardContent className="p-4 pt-16 h-full flex flex-col justify-between">
            <div className="space-y-3">
              {/* Texto da questão */}
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-3 leading-relaxed">
                {questao.enunciado}
              </p>

              {/* Badge do tipo de questão */}
              <div className="flex justify-start">
                <Badge variant="outline" className="text-xs font-medium bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700">
                  {questao.type === 'multipla-escolha' ? 'Múltipla Escolha' :
                     questao.type === 'verdadeiro-falso' ? 'V ou F' : 'Discursiva'}
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

                {/* Indicador visual de hover */}
                <div className="w-2 h-2 rounded-full bg-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-4 dark:text-gray-300">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <p className="text-gray-600 dark:text-gray-300">Gerando lista de exercícios...</p>
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
          <div className="w-72 bg-slate-50 border-r border-slate-200 overflow-y-auto dark:bg-gray-900 dark:border-gray-700">
            <div className="p-2 space-y-2">
              {questoesProcessadas.map((questao, index) => {
                const difficulty = determineDifficulty(questao);
                const difficultyConfig = DIFFICULTY_LEVELS[difficulty];
                const isSelected = selectedQuestionIndex === index;
                const isAnswered = respostas[questao.id] !== undefined;

                // Função para obter o ícone do tipo de questão
                const getQuestionTypeIcon = (type: Question['type']) => {
                  switch (type) {
                    case 'multipla-escolha':
                      return <Circle className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
                    case 'discursiva':
                      return <Edit3 className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
                    case 'verdadeiro-falso':
                      return <CheckCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
                    default:
                      return <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
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
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 border ${
                      isSelected
                        ? 'bg-orange-100 dark:bg-orange-900/50 border-2 border-orange-300 dark:border-orange-600'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
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
                              {generateQuestionTag(questao.enunciado || '', questao.alternativas)}
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
            {/* Cabeçalho da questão detalhada */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-6 border-b border-orange-200 dark:border-orange-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-800/50 rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para Grade
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedQuestionIndex(Math.max(0, selectedQuestionIndex - 1))}
                    disabled={selectedQuestionIndex === 0}
                    className="p-2 hover:bg-orange-100 dark:hover:bg-orange-800/50 rounded-xl disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-700">
                    {selectedQuestionIndex + 1} de {questoesProcessadas.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedQuestionIndex(Math.min(questoesProcessadas.length - 1, selectedQuestionIndex + 1))}
                    disabled={selectedQuestionIndex === questoesProcessadas.length - 1}
                    className="p-2 hover:bg-orange-100 dark:hover:bg-orange-800/50 rounded-xl disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-orange-800 dark:text-orange-200">
                  Questão {selectedQuestionIndex + 1}
                </h2>

                <div className="flex items-center gap-3">
                  {selectedQuestion && (() => {
                    const difficulty = determineDifficulty(selectedQuestion);
                    const difficultyConfig = DIFFICULTY_LEVELS[difficulty];
                    return (
                      <Badge 
                        variant="secondary" 
                        className={`px-3 py-1 text-sm font-medium ${difficultyConfig.bgColor} ${difficultyConfig.textColor} ${difficultyConfig.borderColor} border`}
                      >
                        {difficultyConfig.label}
                      </Badge>
                    );
                  })()}

                  <Badge variant="outline" className="bg-white dark:bg-gray-800 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700">
                    {selectedQuestion?.type === 'multipla-escolha' ? 'Múltipla Escolha' :
                     selectedQuestion?.type === 'verdadeiro-falso' ? 'V ou F' : 'Discursiva'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Conteúdo da questão */}
            <div className="p-6">
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
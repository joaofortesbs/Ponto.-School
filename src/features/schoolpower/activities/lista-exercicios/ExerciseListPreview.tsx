import React, { useState, useEffect, useMemo } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, BookOpen, Target, Users, FileText, Eye, EyeOff, GripVertical, AlertCircle, Circle, Edit3, CheckCircle } from 'lucide-react';

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
  numero?: number;
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
  const [reorderableQuestoes, setReorderableQuestoes] = useState<Question[]>([]);

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
      // Processa questões da IA
      console.log('✅ Processando', questoesDaIA.length, 'questões da IA');
      const questoesProcessadas = questoesDaIA.map((questao, index) => {
        console.log(`📄 Questão ${index + 1} processada:`, {
          id: questao.id,
          type: questao.type,
          enunciadoLength: questao.enunciado?.length || 0,
          hasAlternativas: !!questao.alternativas,
          alternativasCount: questao.alternativas?.length || 0
        });

        return {
          id: questao.id || `questao-${index + 1}`,
          numero: index + 1,
          enunciado: questao.enunciado || '',
          alternativas: questao.alternativas || [],
          respostaCorreta: questao.respostaCorreta !== undefined ? questao.respostaCorreta : 0,
          explicacao: questao.explicacao || '',
          type: questao.type || 'multipla-escolha'
        };
      });

      setQuestoesProcessadas(questoesProcessadas);
      setReorderableQuestoes(questoesProcessadas);

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
        <Card className="h-52 hover:shadow-xl transition-all duration-300 border-2 border-gray-200/60 hover:border-orange-400/60 group-hover:scale-[1.02] dark:bg-gray-800/90 dark:border-gray-600/60 dark:hover:border-orange-500/60 rounded-2xl backdrop-blur-sm bg-white/95 shadow-md">
          {/* Container para numeração e tag de dificuldade */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            {/* Numeração da questão */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white border-2 border-white/20">
              {index + 1}
            </div>

            {/* Tag de dificuldade */}
            <Badge className={`text-xs px-3 py-1 rounded-full shadow-md font-medium ${difficultyConfig.color} ${difficultyConfig.textColor} dark:opacity-95 border border-white/20`}>
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
                <div className="w-2 h-2 rounded-full bg-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Componente da grade de questões
  const renderQuestionsGrid = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Grade de questões */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {questoesProcessadas.map((questao, index) =>
          renderQuestionGridCard(questao, index)
        )}
      </div>

      {/* Informações adicionais */}
      {consolidatedData.observacoes && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-yellow-950/30 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-yellow-200 mb-1">Observações Importantes</h4>
                <p className="text-amber-700 dark:text-yellow-300 text-sm">{consolidatedData.observacoes}</p>
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
        className="mb-4 border-l-4 border-l-orange-500 scroll-mt-4 dark:bg-gray-800 dark:border-l-orange-600"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
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
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {questao.type === 'multipla-escolha' && (
            <div className="space-y-3">
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
                        {textoAlternativa}
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
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Explicação
                      </h4>
                    </div>
                    <div className="text-orange-800 dark:text-orange-200 whitespace-pre-wrap mb-4">
                      {questao.explicacao}
                    </div>

                    {/* Gabarito da Questão */}
                    {questao.gabarito && (
                      <div className="pt-4 border-t border-orange-200 dark:border-orange-700">
                        <h5 className="font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Gabarito
                        </h5>
                        <div className="text-orange-800 dark:text-orange-200 font-medium">
                          {questao.tipo === 'multipla-escolha' ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                              Alternativa {questao.gabarito}
                            </span>
                          ) : questao.tipo === 'verdadeiro-falso' ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                              {questao.gabarito === 'V' || questao.gabarito === 'Verdadeiro' ? 'Verdadeiro' : 'Falso'}
                            </span>
                          ) : (
                            <div className="text-sm whitespace-pre-wrap">
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
      <div className="flex flex-col items-center justify-center p-8 space-4 dark:text-gray-300">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
          <div className="w-72 bg-orange-50/30 border-r border-orange-200/50 overflow-y-auto dark:bg-gray-900 dark:border-gray-700">
            <div className="p-2 space-y-2">
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

          {/* Área principal com a questão selecionada */}
          <div className="flex-1 h-full overflow-y-auto">
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
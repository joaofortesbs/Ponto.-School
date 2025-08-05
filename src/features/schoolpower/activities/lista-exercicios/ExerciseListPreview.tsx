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
import { CheckCircle, Circle, Edit3, FileText, Clock, GraduationCap, BookOpen, Target, List, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

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
}

const ExerciseListPreview: React.FC<ExerciseListPreviewProps> = ({ 
  data, 
  isGenerating = false,
  onRegenerateContent,
  onQuestionRender
}) => {
  const [respostas, setRespostas] = useState<Record<string, string | number>>({});
  const [questoesExpandidas, setQuestoesExpandidas] = useState<Record<string, boolean>>({});
  const [explicacoesExpandidas, setExplicacoesExpandidas] = useState<Record<string, boolean>>({});
  const [questoesProcessadas, setQuestoesProcessadas] = useState<Question[]>([]);

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
    const nivel = dificuldade ? dificuldade.toLowerCase() : 'medio';
    switch (nivel) {
      case 'facil': 
      case 'fácil':
      case 'básico':
      case 'basico':
        return 'bg-green-100 text-green-800';
      case 'medio': 
      case 'médio':
      case 'intermediário':
      case 'intermediario':
        return 'bg-yellow-100 text-yellow-800';
      case 'dificil': 
      case 'difícil':
      case 'avançado':
      case 'avancado':
        return 'bg-red-100 text-red-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
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

  const renderQuestionContent = (questao: Question, index: number) => {
    const tipo = (questao.tipo || questao.type || 'multipla-escolha').toLowerCase();

    switch (tipo) {
      case 'multipla-escolha':
      case 'multiple-choice':
      case 'múltipla escolha':
        const alternativas = questao.alternativas || questao.alternatives || questao.options || [];

        if (!alternativas || alternativas.length === 0) {
          return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">Alternativas não encontradas para esta questão.</p>
            </div>
          );
        }

        return (
          <div className="space-y-3">
            {alternativas.map((alt: any, altIndex: number) => {
              const letter = String.fromCharCode(97 + altIndex).toUpperCase(); // A, B, C, D...
              const isCorrect = alt.correta || alt.correct || alt.isCorrect;
              const texto = alt.texto || alt.text || alt.content || alt;

              return (
                <div 
                  key={altIndex}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-all duration-200 ${
                    isCorrect 
                      ? 'bg-green-50 border-green-200 shadow-sm' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCorrect 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-400 text-white'
                  }`}>
                    {letter}
                  </div>
                  <div className="flex-1 text-gray-800 leading-relaxed">
                    {typeof texto === 'string' ? texto : JSON.stringify(texto)}
                  </div>
                  {isCorrect && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  )}
                </div>
              );
            })}

            {(questao.explicacao || questao.explanation) && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Explicação:
                </h5>
                <p className="text-blue-800 text-sm leading-relaxed">{questao.explicacao || questao.explanation}</p>
              </div>
            )}
          </div>
        );

      case 'discursiva':
      case 'essay':
        return (
          <div className="space-y-4">
            <div className="min-h-[120px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <p className="text-gray-500 text-sm">Área para resposta discursiva</p>
            </div>

            {(questao.explicacao || questao.explanation) && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Orientações para resposta:</h5>
                <p className="text-blue-800 text-sm">{questao.explicacao || questao.explanation}</p>
              </div>
            )}
          </div>
        );

      case 'verdadeiro-falso':
      case 'true-false':
        return (
          <div className="space-y-3">
            {['Verdadeiro', 'Falso'].map((opcao, opcaoIndex) => {
              const isCorrect = (questao.resposta_correta || questao.correct_answer || '').toLowerCase() === opcao.toLowerCase();

              return (
                <div 
                  key={opcaoIndex}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                    isCorrect 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCorrect 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-400 text-white'
                  }`}>
                    {opcao.charAt(0)}
                  </div>
                  <span className="text-gray-800 font-medium">{opcao}</span>
                  {isCorrect && (
                    <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                  )}
                </div>
              );
            })}

            {(questao.explicacao || questao.explanation) && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Explicação:</h5>
                <p className="text-blue-800 text-sm">{questao.explicacao || questao.explanation}</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-600">Tipo de questão: {tipo}</p>
            <pre className="mt-2 text-xs text-gray-500 overflow-auto">
              {JSON.stringify(questao, null, 2)}
            </pre>
          </div>
        );
    }
  };

  const renderQuestion = (questao: Question, index: number) => {
    const questionId = questao.id || `questao-${index + 1}`;

    // Extrair e processar alternativas de forma mais robusta
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
        className="mb-4 border-l-4 border-l-blue-500 scroll-mt-4"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  Questão {index + 1}
                </Badge>
                <Badge className={`text-xs ${getDifficultyColor(questao.dificuldade)}`}>
                  {questao.dificuldade || 'Médio'}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  {getTypeIcon(questao.type)}
                  <span>{questao.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
              </div>
              <CardTitle className="text-base font-medium leading-relaxed">
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
                          ? 'bg-blue-50 border-blue-300 shadow-sm' 
                          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                      onClick={() => handleRespostaChange(questao.id, altIndex)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                        isSelected 
                          ? 'bg-blue-500 text-white border-blue-500' 
                          : 'bg-white text-gray-600 border-gray-300'
                      }`}>
                        {letter}
                      </div>
                      <div className="flex-1 text-gray-800 leading-relaxed pt-1">
                        {textoAlternativa}
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Alternativas não encontradas para esta questão de múltipla escolha.
                  </p>
                  <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                    {JSON.stringify(questao, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {questao.type === 'verdadeiro-falso' && (
            <div className="space-y-3">
              {['Verdadeiro', 'Falso'].map((opcao, opcaoIndex) => {
                const isSelected = respostas[questao.id] === opcao.toLowerCase();

                return (
                  <div 
                    key={opcaoIndex}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-300 shadow-sm' 
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                    onClick={() => handleRespostaChange(questao.id, opcao.toLowerCase())}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                      isSelected 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'bg-white text-gray-600 border-gray-300'
                    }`}>
                      {opcao.charAt(0)}
                    </div>
                    <span className="text-gray-800 font-medium flex-1">{opcao}</span>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {questao.type === 'discursiva' && (
            <div className="space-y-3">
              <Textarea
                placeholder="Digite sua resposta aqui..."
                value={respostas[questao.id]?.toString() || ''}
                onChange={(e) => handleRespostaChange(questao.id, e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <div className="text-xs text-gray-500">
                Resposta: {respostas[questao.id]?.toString()?.length || 0} caracteres
              </div>
            </div>
          )}

          {questao.explicacao && (
            <div className="mt-4">
              <div 
                className="p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-400 cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => toggleExplicacaoExpandida(questao.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-blue-800">Explicação</div>
                  <div className="text-blue-600">
                    {explicacoesExpandidas[questao.id] ? '−' : '+'}
                  </div>
                </div>
                {explicacoesExpandidas[questao.id] && (
                  <div className="text-sm text-blue-700 mt-2 pt-2 border-t border-blue-200">
                    {questao.explicacao}
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
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Gerando lista de exercícios...</p>
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
    <div className="space-y-6">
      {/* Lista de Questões */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Questões ({questoesProcessadas.length})</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Progresso: {Object.keys(respostas).length}/{questoesProcessadas.length}</span>
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ 
                  width: `${(Object.keys(respostas).length / questoesProcessadas.length) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>

        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {questoesProcessadas.map((questao, index) => renderQuestion(questao, index))}
          </div>
        </ScrollArea>
      </div>

      {/* Instruções Adicionais */}
      {consolidatedData.observacoes && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">Observações Importantes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700">{consolidatedData.observacoes}</p>
          </CardContent>
        </Card>
      )}

      {/* Resumo de Respostas */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Resumo das Respostas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Questões Respondidas:</span>
              <span className="ml-2">{Object.keys(respostas).length}</span>
            </div>
            <div>
              <span className="font-medium">Questões Pendentes:</span>
              <span className="ml-2">{questoesProcessadas.length - Object.keys(respostas).length}</span>
            </div>
            <div>
              <span className="font-medium">Progresso:</span>
              <span className="ml-2">
                {Math.round((Object.keys(respostas).length / questoesProcessadas.length) * 100)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExerciseListPreview;
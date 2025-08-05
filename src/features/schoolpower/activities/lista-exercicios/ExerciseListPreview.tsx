import React, { useRef, useState, useEffect } from 'react';
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

interface Question {
  id: string;
  type: 'multipla-escolha' | 'discursiva' | 'verdadeiro-falso';
  enunciado: string;
  alternativas?: string[];
  respostaCorreta?: string | number;
  explicacao?: string;
  dificuldade?: 'facil' | 'medio' | 'dificil';
  tema?: string;
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
}

interface ExerciseListPreviewProps {
  data: ExerciseListData;
  isGenerating?: boolean;
  onRegenerateContent?: () => void;
}

const ExerciseListPreview: React.FC<ExerciseListPreviewProps> = ({ 
  data, 
  isGenerating = false,
  onRegenerateContent 
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
        const questaoProcessada = {
          id: questao.id || `questao-${index + 1}`,
          type: (questao.type || questao.tipo || 'multipla-escolha').toLowerCase().replace('_', '-'),
          enunciado: questao.enunciado || questao.pergunta || questao.question || `Questão ${index + 1}`,
          alternativas: questao.alternativas || questao.alternatives || questao.options || [],
          respostaCorreta: questao.respostaCorreta || questao.correctAnswer || 0,
          explicacao: questao.explicacao || questao.explanation || '',
          dificuldade: (questao.dificuldade || questao.difficulty || 'medio').toLowerCase(),
          tema: questao.tema || questao.topic || data.tema || 'Tema não especificado'
        };

        // Validação de tipos específicos
        if (questaoProcessada.type === 'multipla-escolha' || questaoProcessada.type === 'multipla_escolha') {
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
        } else if (questaoProcessada.type === 'verdadeiro-falso' || questaoProcessada.type === 'verdadeiro_falso') {
          questaoProcessada.type = 'verdadeiro-falso';
          questaoProcessada.alternativas = ['Verdadeiro', 'Falso'];
        } else if (questaoProcessada.type === 'discursiva') {
          // Questões discursivas não precisam de alternativas
          questaoProcessada.alternativas = undefined;
        }

        console.log(`📄 Questão ${index + 1} processada:`, {
          id: questaoProcessada.id,
          type: questaoProcessada.type,
          enunciadoLength: questaoProcessada.enunciado.length,
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
        dificuldade: (activityData.dificuldade ? activityData.dificuldade.toLowerCase() : 'medio') as 'facil' | 'medio' | 'dificil',
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

  const getSidebarDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'facil':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'medio':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'dificil':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
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

  const renderQuestao = (questao: Question, index: number) => {
    const isExpandida = questoesExpandidas[questao.id];
    const respostaAtual = respostas[questao.id];

    return (
      <Card key={questao.id} className="mb-4 border-l-4 border-l-blue-500">
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
          {questao.type === 'multipla-escolha' && questao.alternativas && (
            <RadioGroup 
              value={respostaAtual?.toString() || ''} 
              onValueChange={(value) => handleRespostaChange(questao.id, parseInt(value))}
              className="space-y-3"
            >
              {questao.alternativas.map((alternativa, altIndex) => (
                <div key={altIndex} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value={altIndex.toString()} id={`${questao.id}-${altIndex}`} />
                  <Label 
                    htmlFor={`${questao.id}-${altIndex}`} 
                    className="flex-1 cursor-pointer font-normal"
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + altIndex)})</span>
                    {alternativa}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {questao.type === 'verdadeiro-falso' && (
            <RadioGroup 
              value={respostaAtual?.toString() || ''} 
              onValueChange={(value) => handleRespostaChange(questao.id, value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <RadioGroupItem value="true" id={`${questao.id}-true`} />
                <Label htmlFor={`${questao.id}-true`} className="flex-1 cursor-pointer font-normal">
                  <CheckCircle className="w-4 h-4 inline mr-2 text-green-600" />
                  Verdadeiro
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <RadioGroupItem value="false" id={`${questao.id}-false`} />
                <Label htmlFor={`${questao.id}-false`} className="flex-1 cursor-pointer font-normal">
                  <Circle className="w-4 h-4 inline mr-2 text-red-600" />
                  Falso
                </Label>
              </div>
            </RadioGroup>
          )}

          {questao.type === 'discursiva' && (
            <div className="space-y-3">
              <Textarea
                placeholder="Digite sua resposta aqui..."
                value={respostaAtual?.toString() || ''}
                onChange={(e) => handleRespostaChange(questao.id, e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <div className="text-xs text-gray-500">
                Resposta: {respostaAtual?.toString()?.length || 0} caracteres
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
      <div className="flex flex-col items-center justify-center p-8 space-4">
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

  const questions = questoesProcessadas;
  const questionsContainerRef = useRef<HTMLDivElement>(null);

  const scrollToQuestion = (questionIndex: number) => {
    const questionElement = document.getElementById(`question-${questionIndex + 1}`);
    if (questionElement && questionsContainerRef.current) {
      const container = questionsContainerRef.current;
      const elementTop = questionElement.offsetTop - container.offsetTop;
      container.scrollTo({
        top: elementTop - 20, 
        behavior: 'smooth'
      });
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + (q.pontos || 1), 0);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'multipla-escolha':
        return 'Múltipla Escolha';
      case 'dissertativa':
        return 'Dissertativa';
      case 'verdadeiro-falso':
        return 'Verdadeiro/Falso';
      default:
        return type;
    }
  };


  return (
    <div className="flex h-full">
      {/* Sidebar de Navegação das Questões */}
      <div className="w-72 bg-gray-50 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-sm font-medium text-gray-900 mb-1">
              Questões: <span className="text-blue-600">{questions.length}</span>
            </div>
            <div className="text-sm text-gray-600">
              Total de pontos: <span className="text-green-600">{totalPoints}</span>
            </div>
          </div>
        </div>

        <div className="p-2 space-y-2">
          {questions.map((question, index) => (
            <button
              key={question.id || index}
              onClick={() => scrollToQuestion(index)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-sm ${getSidebarDifficultyColor(question.dificuldade)}`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full font-semibold text-sm border border-gray-300">
                  {index + 1}
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">
                    {question.dificuldade}
                  </div>
                  <div className="text-xs text-gray-600">
                    {question.pontos || 1} ponto{(question.pontos || 1) > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="text-gray-400">
                {question.type === 'multipla-escolha' && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                )}
                {question.type === 'dissertativa' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                )}
                {question.type === 'verdadeiro-falso' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto" ref={questionsContainerRef}>
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Header da Lista de Exercícios */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {consolidatedData.titulo || 'Lista de Exercícios'}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {consolidatedData.disciplina} • {consolidatedData.anoEscolaridade || 'Série'} • {consolidatedData.tema}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Target className="w-3 h-3 mr-1" />
                    {questions.length} questões
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    {totalPoints} pontos
                  </Badge>
                </div>
              </div>

              {consolidatedData.descricao && (
                <p className="text-gray-700 mt-3 text-sm leading-relaxed">
                  {consolidatedData.descricao}
                </p>
              )}

              {consolidatedData.tempoLimite && (
                <div className="flex items-center mt-3 text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  Tempo estimado: {consolidatedData.tempoLimite}
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Lista de Questões */}
          {questions.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Questões ({questions.length})
                </h2>
                <div className="text-sm text-gray-600">
                  Progresso: {Object.keys(respostas).length}/{questions.length}
                </div>
              </div>

              {questions.map((questao, index) => (
                <Card 
                  key={questao.id} 
                  id={`question-${index + 1}`}
                  className="border border-gray-200 hover:shadow-md transition-shadow scroll-mt-6"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getDifficultyColor(questao.dificuldade)}>
                            {questao.dificuldade}
                          </Badge>
                          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                            {getTypeLabel(questao.type)}
                          </Badge>
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            {questao.pontos || 1} ponto{(questao.pontos || 1) > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="text-gray-800 mb-4 leading-relaxed">
                      {questao.enunciado}
                    </p>

                    {questao.type === 'multipla-escolha' && questao.alternativas && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 mb-3">Resposta:</p>
                        <div className="space-y-2">
                          {questao.alternativas.map((alternativa, altIndex) => (
                            <label key={altIndex} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                              <input
                                type="radio"
                                name={`question-${questao.id}`}
                                className="mt-1 text-blue-600 focus:ring-blue-500"
                                checked={respostas[questao.id]?.toString() === altIndex.toString()}
                                onChange={() => handleRespostaChange(questao.id, altIndex)}
                              />
                              <span className="text-gray-700 flex-1">
                                <span className="font-medium mr-2">{String.fromCharCode(65 + altIndex)})</span>
                                {alternativa}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {questao.type === 'dissertativa' && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Digite sua resposta aqui:</p>
                        <textarea
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={4}
                          placeholder="Digite sua resposta aqui..."
                          value={respostas[questao.id]?.toString() || ''}
                          onChange={(e) => handleRespostaChange(questao.id, e.target.value)}
                        />
                      </div>
                    )}

                    {questao.type === 'verdadeiro-falso' && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 mb-3">Resposta:</p>
                        <div className="flex space-x-4">
                          <label className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name={`question-${questao.id}`}
                              className="text-green-600 focus:ring-green-500"
                              checked={respostas[questao.id]?.toString() === 'true'}
                              onChange={() => handleRespostaChange(questao.id, 'true')}
                            />
                            <span className="text-gray-700 font-medium">Verdadeiro</span>
                          </label>
                          <label className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name={`question-${questao.id}`}
                              className="text-red-600 focus:ring-red-500"
                              checked={respostas[questao.id]?.toString() === 'false'}
                              onChange={() => handleRespostaChange(questao.id, 'false')}
                            />
                            <span className="text-gray-700 font-medium">Falso</span>
                          </label>
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
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma questão disponível
                </h3>
                <p className="text-gray-600">
                  As questões desta lista de exercícios serão exibidas aqui.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseListPreview;
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
import { CheckCircle, Circle, Edit3, FileText, Clock, GraduationCap } from 'lucide-react';

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
  const [questoesProcessadas, setQuestoesProcessadas] = useState<Question[]>([]);

  // Processar conteúdo gerado pela IA e extrair questões
  useEffect(() => {
    if (data.questoes && data.questoes.length > 0) {
      setQuestoesProcessadas(data.questoes);
    } else {
      // Simular processamento de questões se não houver dados estruturados
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
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-400">
              <div className="text-sm font-medium text-blue-800 mb-1">Explicação:</div>
              <div className="text-sm text-blue-700">{questao.explicacao}</div>
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
    questoes: data?.questoes || []
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Lista */}
      
<Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl text-blue-900">{consolidatedData.titulo}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-blue-700">
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  <span>{consolidatedData.disciplina}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{consolidatedData.tema}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{questoesProcessadas.length} questões</span>
                </div>
              </div>
            </div>
            {onRegenerateContent && (
              <Button variant="outline" size="sm" onClick={onRegenerateContent}>
                Regenerar Conteúdo
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Objetivos */}
      {consolidatedData.objetivos && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Objetivos de Aprendizagem</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{consolidatedData.objetivos}</p>
          </CardContent>
        </Card>
      )}

      <Separator />

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
            {questoesProcessadas.map((questao, index) => renderQuestao(questao, index))}
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
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Settings, FileText, Play, Download, Edit3, Copy, Save, BookOpen, GamepadIcon, PenTool, Calculator, Beaker, GraduationCap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { ConstructionActivity } from './types';
import { ActivityFormData } from './types/ActivityTypes';
import { useGenerateActivity } from './hooks/useGenerateActivity';
import ActivityPreview from '@/features/schoolpower/activities/default/ActivityPreview';
import ExerciseListPreview from '@/features/schoolpower/activities/lista-exercicios/ExerciseListPreview';
import PlanoAulaPreview from '@/features/schoolpower/activities/plano-aula/PlanoAulaPreview';
import SequenciaDidaticaPreview from '@/features/schoolpower/activities/sequencia-didatica/SequenciaDidaticaPreview';
import QuadroInterativoPreview from '@/features/schoolpower/activities/quadro-interativo/QuadroInterativoPreview';
import QuizInterativoPreview from '@/features/schoolpower/activities/quiz-interativo/QuizInterativoPreview';
import { CheckCircle2 } from 'lucide-react';

// --- Componentes de Edição Específicos ---

// Componente genérico para campos comuns
const DefaultEditActivity = ({formData, onFieldChange }: {formData: ActivityFormData, onFieldChange: (field: keyof ActivityFormData, value: string) => void }) => (
  <>
    <div>
      <Label htmlFor="objectives" className="text-sm">Objetivos de Aprendizagem</Label>
      <Textarea
        id="objectives"
        value={formData.objectives}
        onChange={(e) => onFieldChange('objectives', e.target.value)}
        placeholder="Descreva os objetivos que os alunos devem alcançar..."
        className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>

    <div>
      <Label htmlFor="materials" className="text-sm">Materiais Necessários</Label>
      <Textarea
        id="materials"
        value={formData.materials}
        onChange={(e) => onFieldChange('materials', e.target.value)}
        placeholder="Liste os materiais necessários (um por linha)..."
        className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>

    <div>
      <Label htmlFor="instructions" className="text-sm">Instruções da Atividade</Label>
      <Textarea
        id="instructions"
        value={formData.instructions}
        onChange={(e) => onFieldChange('instructions', e.target.value)}
        placeholder="Descreva como a atividade deve ser executada..."
        className="mt-1 min-h-[80px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>

    <div>
      <Label htmlFor="evaluation" className="text-sm">Critérios de Avaliação</Label>
      <Textarea
        id="evaluation"
        value={formData.evaluation}
        onChange={(e) => onFieldChange('evaluation', e.target.value)}
        placeholder="Como a atividade será avaliada..."
        className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>
  </>
);

// Componente específico para Quiz Interativo
const QuizInterativoEditActivity = ({formData, onFieldChange }: {formData: ActivityFormData, onFieldChange: (field: keyof ActivityFormData, value: string) => void }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="numberOfQuestions">Número de Questões *</Label>
        <Input
          id="numberOfQuestions"
          type="number"
          value={formData.numberOfQuestions || ''}
          onChange={(e) => onFieldChange('numberOfQuestions', e.target.value)}
          placeholder="Ex: 10, 15, 20"
          min="1"
          max="50"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
      <div>
        <Label htmlFor="theme">Tema *</Label>
        <Input
          id="theme"
          value={formData.theme || ''}
          onChange={(e) => onFieldChange('theme', e.target.value)}
          placeholder="Ex: Teorema de Pitágoras, Revolução Francesa"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="subject">Disciplina *</Label>
        <Input
          id="subject"
          value={formData.subject || ''}
          onChange={(e) => onFieldChange('subject', e.target.value)}
          placeholder="Ex: Matemática, Português, História"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
      <div>
        <Label htmlFor="schoolYear">Ano de Escolaridade *</Label>
        <Input
          id="schoolYear"
          value={formData.schoolYear || ''}
          onChange={(e) => onFieldChange('schoolYear', e.target.value)}
          placeholder="Ex: 6º Ano - Ensino Fundamental"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="difficultyLevel">Nível de Dificuldade *</Label>
        <Input
          id="difficultyLevel"
          value={formData.difficultyLevel || ''}
          onChange={(e) => onFieldChange('difficultyLevel', e.target.value)}
          placeholder="Ex: Fácil, Médio, Difícil"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
      <div>
        <Label htmlFor="questionModel">Formato *</Label>
        <Input
          id="questionModel"
          value={formData.questionModel || ''}
          onChange={(e) => onFieldChange('questionModel', e.target.value)}
          placeholder="Ex: Múltipla Escolha, Verdadeiro ou Falso"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
    </div>
  </div>
);

// Componente específico para Quadro Interativo
const QuadroInterativoEditActivity = ({formData, onFieldChange }: {formData: ActivityFormData, onFieldChange: (field: keyof ActivityFormData, value: string) => void }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="subject">Disciplina / Área de conhecimento *</Label>
        <Input
          id="subject"
          value={formData.subject || ''}
          onChange={(e) => onFieldChange('subject', e.target.value)}
          placeholder="Ex: Matemática, Português, Ciências"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
      <div>
        <Label htmlFor="schoolYear">Ano / Série *</Label>
        <Input
          id="schoolYear"
          value={formData.schoolYear || ''}
          onChange={(e) => onFieldChange('schoolYear', e.target.value)}
          placeholder="Ex: 6º Ano, 7º Ano, 8º Ano"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
    </div>

    <div>
      <Label htmlFor="theme">Tema ou Assunto da aula *</Label>
      <Input
        id="theme"
        value={formData.theme || ''}
        onChange={(e) => onFieldChange('theme', e.target.value)}
        placeholder="Ex: Substantivos e Verbos, Frações, Sistema Solar"
        required
        className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>

    <div>
      <Label htmlFor="objectives">Objetivo de aprendizagem da aula *</Label>
      <Textarea
        id="objectives"
        value={formData.objectives || ''}
        onChange={(e) => onFieldChange('objectives', e.target.value)}
        placeholder="Descreva os objetivos específicos que os alunos devem alcançar com esta atividade de quadro interativo..."
        rows={3}
        required
        className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="difficultyLevel">Nível de Dificuldade *</Label>
        <Input
          id="difficultyLevel"
          value={formData.difficultyLevel || ''}
          onChange={(e) => onFieldChange('difficultyLevel', e.target.value)}
          placeholder="Ex: Básico, Intermediário, Avançado"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
      <div>
        <Label htmlFor="quadroInterativoCampoEspecifico">Atividade mostrada *</Label>
        <Input
          id="quadroInterativoCampoEspecifico"
          value={formData.quadroInterativoCampoEspecifico || ''}
          onChange={(e) => onFieldChange('quadroInterativoCampoEspecifico', e.target.value)}
          placeholder="Ex: Jogo de arrastar e soltar, Quiz interativo, Mapa mental"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
    </div>
  </div>
);

// Componente específico para Sequência Didática
const SequenciaDidaticaEditActivity = ({formData, onFieldChange }: {formData: ActivityFormData, onFieldChange: (field: keyof ActivityFormData, value: string) => void }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="tituloTemaAssunto">Título do Tema / Assunto *</Label>
        <Input
          id="tituloTemaAssunto"
          value={formData.tituloTemaAssunto || ''}
          onChange={(e) => onFieldChange('tituloTemaAssunto', e.target.value)}
          placeholder="Ex: Substantivos Próprios e Verbos"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
      <div>
        <Label htmlFor="anoSerie">Ano / Série *</Label>
        <Input
          id="anoSerie"
          value={formData.anoSerie || ''}
          onChange={(e) => onFieldChange('anoSerie', e.target.value)}
          placeholder="Ex: 6º Ano do Ensino Fundamental"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="disciplina">Disciplina *</Label>
        <Input
          id="disciplina"
          value={formData.disciplina || ''}
          onChange={(e) => onFieldChange('disciplina', e.target.value)}
          placeholder="Ex: Língua Portuguesa"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
      <div>
        <Label htmlFor="bnccCompetencias">BNCC / Competências</Label>
        <Input
          id="bnccCompetencias"
          value={formData.bnccCompetencias || ''}
          onChange={(e) => onFieldChange('bnccCompetencias', e.target.value)}
          placeholder="Ex: EF06LP01, EF06LP02"
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
    </div>

    <div>
      <Label htmlFor="publicoAlvo">Público-alvo *</Label>
      <Textarea
        id="publicoAlvo"
        value={formData.publicoAlvo || ''}
        onChange={(e) => onFieldChange('publicoAlvo', e.target.value)}
        placeholder="Descrição detalhada do público-alvo..."
        rows={2}
        required
        className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>

    <div>
      <Label htmlFor="objetivosAprendizagem">Objetivos de Aprendizagem *</Label>
      <Textarea
        id="objetivosAprendizagem"
        value={formData.objetivosAprendizagem || ''}
        onChange={(e) => onFieldChange('objetivosAprendizagem', e.target.value)}
        placeholder="Objetivos específicos que os alunos devem alcançar..."
        rows={3}
        required
        className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>

    <div className="grid grid-cols-3 gap-4">
      <div>
        <Label htmlFor="quantidadeAulas">Quantidade de Aulas *</Label>
        <Input
          id="quantidadeAulas"
          type="number"
          value={formData.quantidadeAulas || ''}
          onChange={(e) => onFieldChange('quantidadeAulas', e.target.value)}
          placeholder="Ex: 4"
          min="1"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
      <div>
        <Label htmlFor="quantidadeDiagnosticos">Quantidade de Diagnósticos *</Label>
        <Input
          id="quantidadeDiagnosticos"
          type="number"
          value={formData.quantidadeDiagnosticos || ''}
          onChange={(e) => onFieldChange('quantidadeDiagnosticos', e.target.value)}
          placeholder="Ex: 1"
          min="0"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
      <div>
        <Label htmlFor="quantidadeAvaliacoes">Quantidade de Avaliações *</Label>
        <Input
          id="quantidadeAvaliacoes"
          type="number"
          value={formData.quantidadeAvaliacoes || ''}
          onChange={(e) => onFieldChange('quantidadeAvaliacoes', e.target.value)}
          placeholder="Ex: 2"
          min="0"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
    </div>

    <div>
      <Label htmlFor="cronograma">Cronograma</Label>
      <Textarea
        id="cronograma"
        value={formData.cronograma || ''}
        onChange={(e) => onFieldChange('cronograma', e.target.value)}
        placeholder="Cronograma resumido da sequência didática..."
        rows={3}
        className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>
  </div>
);

// Função para processar dados da lista de exercícios
const processExerciseListData = (formData: ActivityFormData, generatedContent: any) => {
  return {
    title: formData.title,
    description: formData.description,
    subject: formData.subject,
    schoolYear: formData.schoolYear,
    numberOfQuestions: formData.numberOfQuestions,
    difficultyLevel: formData.difficultyLevel,
    questionModel: formData.questionModel,
    sources: formData.sources,
    objectives: formData.objectives,
    materials: formData.materials,
    instructions: formData.instructions,
    evaluation: formData.evaluation,
    timeLimit: formData.timeLimit,
    context: formData.context,
    questions: generatedContent?.questions || [],
    ...generatedContent
  };
};

interface EditActivityModalProps {
  isOpen: boolean;
  activity: ConstructionActivity | null;
  onClose: () => void;
  onSave: (activityData: any) => void;
  onUpdateActivity?: (activity: any) => Promise<void>;
}

interface ActivityFieldsProps {
  formData: ActivityFormData;
  onFieldChange: (field: keyof ActivityFormData, value: string) => void;
}

// Função para obter ícone baseado no tipo de atividade
const getActivityIcon = (activityId: string) => {
  if (activityId.includes('lista-exercicios')) return BookOpen;
  if (activityId.includes('prova')) return FileText;
  if (activityId.includes('jogo')) return GamepadIcon;
  if (activityId.includes('apresentacao')) return Play;
  if (activityId.includes('redacao')) return PenTool;
  if (activityId.includes('matematica')) return Calculator;
  if (activityId.includes('ciencias')) return Beaker;
  if (activityId.includes('quadro-interativo')) return Settings;
  if (activityId.includes('mapa-mental')) return Sparkles; // Ícone para Mapa Mental
  return GraduationCap;
};

/**
 * Modal de Edição de Atividades com Agente Interno de Execução
 */
const EditActivityModal = ({
  isOpen,
  activity,
  onClose,
  onSave,
  onUpdateActivity
}: EditActivityModalProps) => {
  // Estado para controlar qual aba está ativa
  const [activeTab, setActiveTab] = useState<'editar' | 'preview'>('editar');

  // Define initialFormData outside the component scope if it doesn't depend on props that change
  // However, since it depends on `activity`, it must be inside or derived from props.
  const [formData, setFormData] = useState<ActivityFormData>({
    title: activity?.title || activity?.personalizedTitle || '',
    description: activity?.description || activity?.personalizedDescription || '',
    subject: activity?.customFields?.disciplina || activity?.customFields?.['Disciplina'] || '',
    theme: activity?.customFields?.tema || activity?.customFields?.['Tema'] || activity?.personalizedTitle || activity?.title || '',
    schoolYear: activity?.customFields?.anoEscolaridade || activity?.customFields?.['Ano de Escolaridade'] || '',
    numberOfQuestions: activity?.customFields?.quantidadeQuestoes || activity?.customFields?.['Número de Questões'] || '10',
    difficultyLevel: activity?.customFields?.nivelDificuldade || activity?.customFields?.['Nível de Dificuldade'] || 'Médio',
    questionModel: activity?.customFields?.modeloQuestoes || activity?.customFields?.['Modelo de Questões'] || '',
    sources: activity?.customFields?.fontes || activity?.customFields?.['Fontes'] || '',
    objectives: activity?.customFields?.objetivos || activity?.customFields?.['Objetivos de Aprendizagem'] || activity?.description || activity?.personalizedDescription || '',
    materials: activity?.customFields?.materiais || activity?.customFields?.['Materiais Necessários'] || '',
    instructions: activity?.customFields?.instrucoes || activity?.customFields?.['Instruções'] || '',
    evaluation: activity?.customFields?.criteriosAvaliacao || activity?.customFields?.['Critérios de Avaliação'] || '',
    timeLimit: activity?.customFields?.tempoLimite || activity?.customFields?.['Tempo Limite'] || '',
    context: activity?.customFields?.contexto || activity?.customFields?.['Contexto de Aplicação'] || '',
    textType: '',
    textGenre: '',
    textLength: '',
    associatedQuestions: '',
    competencies: activity?.customFields?.competencias || activity?.customFields?.['Habilidades BNCC'] || '',
    readingStrategies: '',
    visualResources: '',
    practicalActivities: '',
    wordsIncluded: '',
    gridFormat: '',
    providedHints: '',
    vocabularyContext: '',
    language: '',
    associatedExercises: '',
    knowledgeArea: '',
    complexityLevel: '',
    // Campos específicos para sequencia-didatica
    tituloTemaAssunto: activity?.customFields?.['Título do Tema / Assunto'] || '',
    anoSerie: activity?.customFields?.['Ano / Série'] || '',
    disciplina: activity?.customFields?.['Disciplina'] || '',
    bnccCompetencias: activity?.customFields?.['BNCC / Competências'] || '',
    publicoAlvo: activity?.customFields?.['Público-alvo'] || '',
    objetivosAprendizagem: activity?.customFields?.['Objetivos de Aprendizagem'] || '',
    quantidadeAulas: activity?.customFields?.['Quantidade de Aulas'] || '',
    quantidadeDiagnosticos: activity?.customFields?.['Quantidade de Diagnósticos'] || '',
    quantidadeAvaliacoes: activity?.customFields?.['Quantidade de Avaliações'] || '',
    cronograma: activity?.customFields?.['Cronograma'] || '',
    // Campos específicos para quadro-interativo
    quadroInterativoCampoEspecifico: activity?.customFields?.['Atividade mostrada'] || activity?.customFields?.['quadroInterativoCampoEspecifico'] || '',
    // Campos específicos para quiz-interativo
    format: activity?.customFields?.['Formato do Quiz'] || '',
    timePerQuestion: activity?.customFields?.['Tempo por Questão'] || '',
    // Campos específicos para Mapa Mental
    centralTheme: activity?.customFields?.['Tema Central'] || activity?.centralTheme || '',
    mainCategories: activity?.customFields?.['Categorias Principais'] || activity?.mainCategories || '',
    generalObjective: activity?.customFields?.['Objetivo Geral'] || activity?.generalObjective || activity?.objectives || '',
    evaluationCriteria: activity?.customFields?.['Critérios de Avaliação'] || activity?.evaluationCriteria || ''
  });

  // Estado para conteúdo gerado
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [quizInterativoContent, setQuizInterativoContent] = useState<any>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Estado para controle de construção da atividade
  const [buildingStatus, setBuildingStatus] = useState({
    isBuilding: false,
    progress: 0,
    currentStep: ''
  });

  // Estado para uso interno da função generateActivityContent
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [builtContent, setBuiltContent] = useState<any>(null);

  const { toast } = useToast();

  // Hook para geração de atividades
  const {
    generateActivity,
    loadSavedContent,
    clearContent,
    isGenerating: isGeneratingDefault, // Renomeado para evitar conflito
  } = useGenerateActivity({
    activityId: activity?.id || '',
    activityType: activity?.id || ''
  });

  // Use isGeneratingDefault for the generic generate activity call
  const isGenerating = isGeneratingDefault;

  // Função para validar se o formulário está pronto para construção
  const isFormValidForBuild = useCallback(() => {
    const activityType = activity?.id || '';

    if (activityType === 'lista-exercicios') {
      return formData.title.trim() &&
             formData.description.trim() &&
             formData.subject.trim() &&
             formData.theme.trim() &&
             formData.schoolYear.trim() &&
             formData.numberOfQuestions.trim() &&
             formData.difficultyLevel.trim() &&
             formData.questionModel.trim();
    } else if (activityType === 'plano-aula') {
      return formData.title.trim() &&
             formData.description.trim() &&
             formData.theme.trim() &&
             formData.schoolYear.trim() &&
             formData.subject.trim() &&
             formData.objectives.trim() &&
             formData.materials.trim();
    } else if (activityType === 'sequencia-didatica') {
      return formData.tituloTemaAssunto?.trim() &&
             formData.anoSerie?.trim() &&
             formData.disciplina?.trim() &&
             formData.publicoAlvo?.trim() &&
             formData.objetivosAprendizagem?.trim() &&
             formData.quantidadeAulas?.trim() &&
             formData.quantidadeDiagnosticos?.trim() &&
             formData.quantidadeAvaliacoes?.trim();
    } else if (activityType === 'quiz-interativo') {
      const isValid = formData.title.trim() &&
                     formData.description.trim() &&
                     formData.numberOfQuestions?.trim() &&
                     formData.theme?.trim() &&
                     formData.subject?.trim() &&
                     formData.schoolYear?.trim() &&
                     formData.difficultyLevel?.trim() &&
                     formData.questionModel?.trim();

      console.log('🔍 Validação do Quiz Interativo:', {
        title: !!formData.title.trim(),
        description: !!formData.description.trim(),
        numberOfQuestions: !!formData.numberOfQuestions?.trim(),
        theme: !!formData.theme?.trim(),
        subject: !!formData.subject?.trim(),
        schoolYear: !!formData.schoolYear?.trim(),
        difficultyLevel: !!formData.difficultyLevel?.trim(),
        questionModel: !!formData.questionModel?.trim(),
        isValid
      });

      return isValid;
    } else if (activityType === 'quadro-interativo') {
      const isValid = formData.title.trim() &&
                     formData.description.trim() &&
                     formData.subject?.trim() &&
                     formData.schoolYear?.trim() &&
                     formData.theme?.trim() &&
                     formData.objectives?.trim() &&
                     formData.difficultyLevel?.trim() &&
                     formData.quadroInterativoCampoEspecifico?.trim();

      console.log('🔍 Validação do Quadro Interativo:', {
        title: !!formData.title.trim(),
        description: !!formData.description.trim(),
        subject: !!formData.subject?.trim(),
        schoolYear: !!formData.schoolYear?.trim(),
        theme: !!formData.theme?.trim(),
        objectives: !!formData.objectives?.trim(),
        difficultyLevel: !!formData.difficultyLevel?.trim(),
        quadroInterativoCampoEspecifico: !!formData.quadroInterativoCampoEspecifico?.trim(),
        isValid
      });

      return isValid;
    } else if (activityType === 'mapa-mental') {
      return formData.title.trim() !== '' &&
             formData.description.trim() !== '' &&
             formData.centralTheme?.trim() !== '' &&
             formData.generalObjective?.trim() !== '';
    }
    else {
      return formData.title.trim() &&
             formData.description.trim() &&
             formData.objectives.trim();
    }
  }, [formData, activity?.id]);

  // --- Geração de Conteúdo ---

  // Função placeholder para gerar conteúdo genérico (usada por atividades não específicas)
  const generateActivityContent = async (type: string, data: any) => {
    console.log(`Gerando conteúdo para tipo: ${type} com dados:`, data);

    if (type === 'quiz-interativo') {
      console.log('🎯 Gerando Quiz Interativo com API Gemini:', data);

      try {
        // Importar o gerador do Quiz Interativo
        const { QuizInterativoGenerator } = await import('@/features/schoolpower/activities/quiz-interativo/QuizInterativoGenerator');

        // Preparar dados para o gerador com validação completa
        const quizData = {
          subject: data.subject?.trim() || 'Matemática',
          schoolYear: data.schoolYear?.trim() || '6º Ano - Ensino Fundamental',
          theme: data.theme?.trim() || data.title?.trim() || 'Tema Geral',
          objectives: data.objectives?.trim() || data.description?.trim() || 'Testar conhecimentos do tema proposto',
          difficultyLevel: data.difficultyLevel?.trim() || 'Médio',
          format: data.questionModel?.trim() || data.format?.trim() || 'Múltipla Escolha',
          numberOfQuestions: data.numberOfQuestions?.trim() || '10',
          timePerQuestion: data.timePerQuestion?.trim() || '60',
          instructions: data.instructions?.trim() || 'Responda às questões no tempo determinado.',
          evaluation: data.evaluation?.trim() || 'Pontuação baseada nas respostas corretas.'
        };

        console.log('🎯 Dados preparados para geração do Quiz:', quizData);
        console.log('📝 Estado atual do formData:', {
          title: data.title,
          description: data.description,
          subject: data.subject,
          theme: data.theme,
          schoolYear: data.schoolYear,
          numberOfQuestions: data.numberOfQuestions,
          difficultyLevel: data.difficultyLevel,
          questionModel: data.questionModel,
          timePerQuestion: data.timePerQuestion
        });

        // Criar instância do gerador e gerar conteúdo
        const generator = new QuizInterativoGenerator();
        const generatedContent = await generator.generateQuizContent(quizData);

        const finalData = {
          ...data,
          ...generatedContent,
          title: data.title || generatedContent.title,
          description: data.description || generatedContent.description,
          isBuilt: true,
          builtAt: new Date().toISOString(),
          generatedByAI: true
        };

        console.log('✅ Quiz Interativo gerado com sucesso:', finalData);

        return {
          success: true,
          data: finalData
        };

      } catch (error) {
        console.error('❌ Erro ao gerar Quiz Interativo via API:', error);

        // Fallback para dados simulados se a API falhar
        const fallbackData = {
          ...data,
          title: data.title || "Quiz Interativo (Modo Demonstração)",
          description: data.description || "Quiz gerado em modo demonstração",
          questions: [
            {
              id: 1,
              question: `Qual é o conceito principal de ${data.theme || 'matemática'}?`,
              type: 'multipla-escolha',
              options: ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
              correctAnswer: 'Opção A',
              explanation: 'Esta é a resposta correta baseada no conceito estudado.'
            }
          ],
          timePerQuestion: parseInt(data.timePerQuestion) || 60,
          totalQuestions: parseInt(data.numberOfQuestions) || 1,
          isBuilt: true,
          builtAt: new Date().toISOString(),
          generatedByAI: false,
          isFallback: true
        };

        return {
          success: true,
          data: fallbackData
        };
      }
    } else if (type === 'quadro-interativo') {
      console.log('🖼️ Preparando dados para Quadro Interativo:', data);

      // Para Quadro Interativo, apenas salvar os dados preparados
      // A geração de conteúdo será feita diretamente no Preview
      const finalData = {
        ...data,
        isBuilt: true,
        builtAt: new Date().toISOString()
      };

      // Salvar dados básicos
      const quadroInterativoStorageKey = `constructed_quadro-interativo_${activity?.id}`;
      localStorage.setItem(quadroInterativoStorageKey, JSON.stringify({
        success: true,
        data: finalData
      }));

      console.log('💾 Dados do Quadro Interativo preparados:', finalData);

      return {
        success: true,
        data: finalData
      };
    } else if (type === 'plano-aula') {
      return {
        success: true,
        data: {
          ...data,
          title: data.title || "Plano de Aula Exemplo",
          description: data.description || "Descrição do plano de aula...",
          content: {
            objetivos: data.objectives,
            materiais: data.materials,
            avaliacao: data.evaluation,
            tempoEstimado: data.timeLimit,
            componenteCurricular: data.subject,
            tema: data.theme,
            anoSerie: data.schoolYear,
            habilidadesBNCC: data.competencies,
            perfilTurma: data.context,
            tipoAula: data.difficultyLevel,
            observacoes: data.evaluation,
          },
          generatedAt: new Date().toISOString(),
          isGeneratedByAI: true,
        }
      };
    } else if (type === 'lista-exercicios') {
      return {
        success: true,
        data: {
          ...data,
          title: data.title || "Lista de Exercícios Exemplo",
          description: data.description || "Descrição da lista de exercícios...",
          questoes: [
            { id: 'q1', enunciado: 'Questão 1?', resposta: 'A', options: ['A', 'B', 'C'], type: 'multipla-escolha' },
            { id: 'q2', enunciado: 'Questão 2?', resposta: 'Verdadeiro', type: 'verdadeiro-falso' },
          ],
          generatedAt: new Date().toISOString(),
          isGeneratedByAI: true,
        }
      };
    } else if (type === 'sequencia-didatica') {
      return {
        success: true,
        data: {
          ...data,
          title: data.tituloTemaAssunto || "Sequência Didática Exemplo",
          description: data.objetivosAprendizagem || "Descrição da sequência didática...",
          content: {
            tituloTemaAssunto: data.tituloTemaAssunto,
            anoSerie: data.anoSerie,
            disciplina: data.disciplina,
            bnccCompetencias: data.bnccCompetencias,
            publicoAlvo: data.publicoAlvo,
            objetivosAprendizagem: data.objetivosAprendizagem,
            quantidadeAulas: data.quantidadeAulas,
            quantidadeDiagnosticos: data.quantidadeDiagnosticos,
            quantidadeAvaliacoes: data.quantidadeAvaliacoes,
            cronograma: data.cronograma,
            subject: data.subject,
            theme: data.theme,
            schoolYear: data.schoolYear,
            competencies: data.competencies,
            objectives: data.objectives,
            materials: data.materials,
            instructions: data.instructions,
            evaluation: data.evaluation,
            timeLimit: data.timeLimit,
            context: data.context,
          },
          generatedAt: new Date().toISOString(),
          isGeneratedByAI: true,
        }
      };
    } else if (type === 'quadro-interativo') {
      return {
        success: true,
        data: {
          ...data,
          title: data.title || "Quadro Interativo Exemplo",
          description: data.description || "Descrição do quadro interativo...",
          generatedAt: new Date().toISOString(),
          isGeneratedByAI: true,
        }
      };
    } else if (type === 'mapa-mental') {
      // Lógica de geração para Mapa Mental (se houver)
      // Por enquanto, apenas retorna os dados do formulário
      return {
        success: true,
        data: {
          ...data,
          title: data.title || `Mapa Mental: ${data.centralTheme}`,
          description: data.description || `Mapa mental sobre ${data.centralTheme}`,
          centralTheme: data.centralTheme,
          mainCategories: data.mainCategories,
          generalObjective: data.generalObjective,
          evaluationCriteria: data.evaluationCriteria, // Assuming this is relevant for Mapas Mentais too
          generatedAt: new Date().toISOString(),
          isGeneratedByAI: true,
        }
      };
    }

    return {
      success: true,
      data: {
        ...data,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true,
      }
    };
  };

  // --- Funções de Geração Específicas ---

  // Função para gerar conteúdo do Quiz Interativo
  const handleGenerateQuizInterativo = async () => {
    try {
      setIsGeneratingQuiz(true);
      setGenerationError(null);

      console.log('🎯 Iniciando geração real do Quiz Interativo');
      console.log('📋 FormData completo:', formData);

      // Validar dados obrigatórios
      if (!formData.title?.trim()) {
        throw new Error('Título é obrigatório');
      }
      if (!formData.theme?.trim()) {
        throw new Error('Tema é obrigatório');
      }
      if (!formData.subject?.trim()) {
        throw new Error('Disciplina é obrigatória');
      }

      // Importar o gerador do Quiz Interativo
      const { QuizInterativoGenerator } = await import('@/features/schoolpower/activities/quiz-interativo/QuizInterativoGenerator');

      // Preparar dados estruturados para o gerador
      const quizData = {
        subject: formData.subject?.trim() || 'Matemática',
        schoolYear: formData.schoolYear?.trim() || '6º Ano - Ensino Fundamental',
        theme: formData.theme?.trim() || formData.title?.trim() || 'Tema Geral',
        objectives: formData.objectives?.trim() || formData.description?.trim() || `Avaliar o conhecimento sobre ${formData.theme}`,
        difficultyLevel: formData.difficultyLevel?.trim() || 'Médio',
        format: formData.questionModel?.trim() || 'Múltipla Escolha',
        numberOfQuestions: formData.numberOfQuestions?.trim() || '10',
        timePerQuestion: formData.timePerQuestion?.trim() || '60',
        instructions: formData.instructions?.trim() || 'Leia cada questão com atenção e selecione a resposta correta.',
        evaluation: formData.evaluation?.trim() || 'Avaliação baseada no número de respostas corretas.'
      };

      console.log('🎯 Dados estruturados para o Gemini:', quizData);

      // Validar campos críticos
      const requiredFields = ['subject', 'theme', 'numberOfQuestions'];
      for (const field of requiredFields) {
        if (!quizData[field as keyof typeof quizData]) {
          throw new Error(`Campo obrigatório não preenchido: ${field}`);
        }
      }

      // Criar instância do gerador e gerar conteúdo
      const generator = new QuizInterativoGenerator();
      const generatedContent = await generator.generateQuizContent(quizData);

      console.log('✅ Conteúdo gerado pela API Gemini:', generatedContent);

      // Validar conteúdo gerado
      if (!generatedContent.questions || generatedContent.questions.length === 0) {
        console.warn('⚠️ Conteúdo gerado sem questões, usando fallback');
        throw new Error('Nenhuma questão foi gerada pela API');
      }

      // Preparar conteúdo final com dados do formulário - ESTRUTURA CORRIGIDA
      const finalContent = {
        title: formData.title || generatedContent.title,
        description: formData.description || generatedContent.description,
        questions: generatedContent.questions, // CRÍTICO: Garantir que as questões sejam transferidas
        timePerQuestion: generatedContent.timePerQuestion || parseInt(quizData.timePerQuestion) || 60,
        totalQuestions: generatedContent.questions.length,
        subject: quizData.subject,
        schoolYear: quizData.schoolYear,
        theme: quizData.theme,
        format: quizData.format,
        difficultyLevel: quizData.difficultyLevel,
        objectives: quizData.objectives,
        instructions: quizData.instructions,
        evaluation: quizData.evaluation,
        generatedByAI: true,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: generatedContent.isGeneratedByAI || true,
        isFallback: false,
        formDataUsed: quizData
      };

      console.log('📦 Conteúdo final preparado:', finalContent);
      console.log('📝 Questões incluídas (CRÍTICO):', finalContent.questions);
      console.log('🔢 Total de questões:', finalContent.questions.length);

      // Salvar no localStorage com estrutura consistente
      const quizStorageKey = `constructed_quiz-interativo_${activity?.id}`;
      const storageData = {
        success: true,
        data: finalContent
      };

      localStorage.setItem(quizStorageKey, JSON.stringify(storageData));
      console.log('💾 Quiz Interativo salvo no localStorage:', quizStorageKey);

      // SINCRONIZAÇÃO CRÍTICA: Atualizar todos os estados
      setQuizInterativoContent(finalContent);
      setGeneratedContent(finalContent);
      setIsContentLoaded(true);

      // Validação detalhada da estrutura
      const validation = {
        hasQuestions: !!(finalContent.questions && finalContent.questions.length > 0),
        questionsCount: finalContent.questions?.length || 0,
        allQuestionsValid: finalContent.questions?.every(q =>
          q.question && q.options && q.options.length > 0 && q.correctAnswer
        ) || false,
        hasTitle: !!finalContent.title,
        hasTimePerQuestion: !!finalContent.timePerQuestion
      };

      console.log('🔍 Validação da estrutura final:', validation);

      if (!validation.hasQuestions || !validation.allQuestionsValid) {
        console.error('❌ Estrutura de dados inválida detectada:', finalContent);
        throw new Error('Dados gerados pela API estão incompletos ou malformados');
      }

      // Force update para garantir sincronização
      setTimeout(() => {
        console.log('🔄 Verificação de sincronização:', {
          quizInterativoContent: !!quizInterativoContent,
          generatedContent: !!generatedContent,
          questionsCount: finalContent.questions.length,
          validation,
          actualQuestions: finalContent.questions
        });

        // Force update com deep clone para garantir reatividade
        setQuizInterativoContent(JSON.parse(JSON.stringify(finalContent)));
        setGeneratedContent(JSON.parse(JSON.stringify(finalContent)));

        // Atualizar aba para mostrar preview
        setActiveTab('preview');
      }, 100);

      toast({
        title: "Quiz Gerado com Sucesso!",
        description: `${finalContent.questions.length} questões foram geradas pela IA do Gemini.`,
      });

    } catch (error) {
      console.error('❌ Erro ao gerar Quiz Interativo:', error);
      setGenerationError(`Erro ao gerar o conteúdo do quiz: ${error.message}`);

      // Criar conteúdo de fallback em caso de erro
      const fallbackContent = {
        title: formData.title || `Quiz: ${formData.theme}`,
        description: formData.description || `Quiz sobre ${formData.theme} (Modo Demonstração)`,
        questions: Array.from({ length: parseInt(formData.numberOfQuestions) || 5 }, (_, index) => ({
          id: index + 1,
          question: `Questão ${index + 1}: Sobre ${formData.theme} em ${formData.subject}, qual conceito é mais importante para o ${formData.schoolYear}?`,
          type: 'multipla-escolha' as const,
          options: [
            `A) Conceito básico de ${formData.theme}`,
            `B) Aplicação prática de ${formData.theme}`,
            `C) Teoria avançada de ${formData.theme}`,
            `D) Exercícios sobre ${formData.theme}`
          ],
          correctAnswer: `A) Conceito básico de ${formData.theme}`,
          explanation: `O conceito básico de ${formData.theme} é essencial para o entendimento em ${formData.subject} no ${formData.schoolYear}.`
        })),
        timePerQuestion: parseInt(formData.timePerQuestion) || 60,
        totalQuestions: parseInt(formData.numberOfQuestions) || 5,
        subject: formData.subject,
        schoolYear: formData.schoolYear,
        theme: formData.theme,
        format: formData.questionModel,
        difficultyLevel: formData.difficultyLevel,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: false,
        isFallback: true
      };

      console.log('🛡️ Usando conteúdo de fallback:', fallbackContent);

      setQuizInterativoContent(fallbackContent);
      setGeneratedContent(fallbackContent);
      setIsContentLoaded(true);
      setActiveTab('preview');

      toast({
        title: "Quiz Criado (Modo Demonstração)",
        description: "Foi criado um quiz de exemplo. Verifique a configuração da API para gerar conteúdo personalizado.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Chamada genérica de geração (para outros tipos de atividade)
  const handleGenerate = async () => {
    if (!activity || isGenerating || !isFormValidForBuild()) return;

    const activityType = activity.type || activity.id || activity.categoryId;
    console.log(`🚀 Iniciando geração genérica para ${activityType}:`, formData);

    try {
      setIsGenerating(true);
      setError(null);
      setBuildProgress(0);

      const progressTimer = setInterval(() => {
        setBuildProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await generateActivityContent(activityType, formData);

      clearInterval(progressTimer);
      setBuildProgress(100);

      console.log('✅ Geração genérica concluída:', result);

      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivities[activity.id] = {
        generatedContent: result,
        timestamp: new Date().toISOString(),
        activityType: activityType
      };
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

      setGeneratedContent(result);
      setBuiltContent(result);
      setIsContentLoaded(true);
      setActiveTab('preview');

      toast({
        title: "Atividade Gerada!",
        description: "Sua atividade foi gerada com sucesso pela IA.",
      });

    } catch (error) {
      console.error('❌ Erro na geração genérica:', error);
      setError(`Erro ao gerar atividade: ${error.message}`);
      toast({
        title: "Erro na Geração",
        description: "Houve um problema ao gerar sua atividade. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setBuildProgress(0);
    }
  };


  // Regenerar conteúdo específico para lista de exercícios
  const handleRegenerateContent = async () => {
    if (activity?.id === 'lista-exercicios') {
      try {
        const newContent = await generateActivity(formData);
        setGeneratedContent(newContent);
      } catch (error) {
        console.error('Erro ao regenerar conteúdo:', error);
        toast({
          title: "Erro ao regenerar",
          description: "Não foi possível regenerar o conteúdo. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  // Carregar conteúdo construído quando o modal abrir
  useEffect(() => {
    if (activity && isOpen) {
      console.log(`🔍 Verificando conteúdo construído para atividade: ${activity.id}`);

      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      const savedContent = localStorage.getItem(`activity_${activity.id}`);
      const planoAulaSavedContent = localStorage.getItem(`constructed_plano-aula_${activity.id}`);
      const sequenciaDidaticaSavedContent = localStorage.getItem(`constructed_sequencia-didatica_${activity.id}`);
      const quadroInterativoSavedContent = localStorage.getItem(`constructed_quadro-interativo_${activity.id}`);
      const quadroInterativoSpecificData = localStorage.getItem(`quadro_interativo_data_${activity.id}`);
      const quizInterativoSavedContent = localStorage.getItem(`constructed_quiz-interativo_${activity.id}`); // New: Load Quiz Interativo content
      const mapaMentalSavedContent = localStorage.getItem(`constructed_mapa-mental_${activity.id}`); // Load Mapa Mental content

      console.log(`🔎 Estado do localStorage:`, {
        constructedActivities: Object.keys(constructedActivities),
        hasSavedContent: !!savedContent,
        hasPlanoAulaSavedContent: !!planoAulaSavedContent,
        hasSequenciaDidaticaSavedContent: !!sequenciaDidaticaSavedContent,
        hasQuadroInterativoSavedContent: !!quadroInterativoSavedContent,
        hasQuadroInterativoSpecificData: !!quadroInterativoSpecificData,
        hasQuizInterativoSavedContent: !!quizInterativoSavedContent,
        hasMapaMentalSavedContent: !!mapaMentalSavedContent,
        activityId: activity.id
      });

      let contentToLoad = null;
      if (activity.id === 'sequencia-didatica' && sequenciaDidaticaSavedContent) {
        try {
          contentToLoad = JSON.parse(sequenciaDidaticaSavedContent);
          console.log(`✅ Conteúdo específico da Sequência Didática encontrado para: ${activity.id}`);
        } catch (error) {
          console.error('❌ Erro ao parsear conteúdo específico da Sequência Didática:', error);
        }
      } else if (activity.id === 'plano-aula' && planoAulaSavedContent) {
        try {
          contentToLoad = JSON.parse(planoAulaSavedContent);
          console.log(`✅ Conteúdo específico do plano-aula encontrado para: ${activity.id}`);
        } catch (error) {
          console.error('❌ Erro ao parsear conteúdo específico do plano-aula:', error);
        }
      } else if (activity.id === 'quadro-interativo' && (quadroInterativoSavedContent || quadroInterativoSpecificData)) {
        try {
          // Priorizar conteúdo construído específico
          if (quadroInterativoSavedContent) {
            contentToLoad = JSON.parse(quadroInterativoSavedContent);
            console.log(`✅ Conteúdo específico do quadro-interativo encontrado para: ${activity.id}`);
          } else if (quadroInterativoSpecificData) {
            contentToLoad = JSON.parse(quadroInterativoSpecificData);
            console.log(`✅ Dados específicos do quadro-interativo encontrados para: ${activity.id}`);
          }
        } catch (error) {
          console.error('❌ Erro ao parsear conteúdo específico do Quadro Interativo:', error);
        }
      } else if (activity.id === 'quiz-interativo' && quizInterativoSavedContent) { // Check for Quiz Interativo content
        try {
          const parsedContent = JSON.parse(quizInterativoSavedContent);
          contentToLoad = parsedContent.data || parsedContent; // Handle both wrapped and direct data

          // Validar se o conteúdo tem questões
          if (contentToLoad && contentToLoad.questions && contentToLoad.questions.length > 0) {
            console.log(`✅ Conteúdo específico do Quiz Interativo encontrado para: ${activity.id}`, contentToLoad);
            console.log(`📝 ${contentToLoad.questions.length} questões carregadas`);
            setQuizInterativoContent(contentToLoad); // Set the specific state for Quiz Interativo
          } else {
            console.warn('⚠️ Conteúdo do Quiz encontrado mas sem questões válidas');
            contentToLoad = null;
          }
        } catch (error) {
          console.error('❌ Erro ao parsear conteúdo específico do Quiz Interativo:', error);
          contentToLoad = null;
        }
      } else if (activity.id === 'mapa-mental' && mapaMentalSavedContent) { // Check for Mapa Mental content
        try {
          const parsedContent = JSON.parse(mapaMentalSavedContent);
          contentToLoad = parsedContent.data || parsedContent;
          if (contentToLoad) {
            console.log(`✅ Conteúdo específico do Mapa Mental encontrado para: ${activity.id}`, contentToLoad);
            // Set the specific state if you have one, or just use generatedContent
            setGeneratedContent(contentToLoad);
            setIsContentLoaded(true);
          }
        } catch (error) {
          console.error('❌ Erro ao parsear conteúdo específico do Mapa Mental:', error);
          contentToLoad = null;
        }
      }
       else if (constructedActivities[activity.id]?.generatedContent) {
        console.log(`✅ Conteúdo construído encontrado no cache para: ${activity.id}`);
        contentToLoad = constructedActivities[activity.id].generatedContent;
      } else if (savedContent) {
        console.log(`✅ Conteúdo salvo encontrado para: ${activity.id}`);
        try {
          contentToLoad = JSON.parse(savedContent);
        } catch (error) {
          console.error('❌ Erro ao parsear conteúdo salvo:', error);
          contentToLoad = null;
        }
      }

      setGeneratedContent(contentToLoad);
      setIsContentLoaded(!!contentToLoad);
    }
  }, [activity, isOpen]);

  useEffect(() => {
    const loadActivityData = async () => {
      if (activity && isOpen) {
        console.log('🔄 Modal aberto, carregando dados para atividade:', activity.id);

        const autoDataKey = `auto_activity_data_${activity.id}`;
        const autoData = localStorage.getItem(autoDataKey);

        if (autoData) {
          try {
            const {
              formData: autoFormData,
              customFields: autoCustomFields,
              originalActivity,
              actionPlanActivity
            } = JSON.parse(autoData);

            console.log('📋 Carregando dados automáticos para:', activity.title);

            const consolidatedData = {
              ...activity,
              ...originalActivity,
              ...actionPlanActivity
            };

            const consolidatedCustomFields = {
              ...activity?.customFields,
              ...autoCustomFields,
              ...originalActivity?.customFields,
              ...actionPlanActivity?.customFields
            } || {};

            const customFields = consolidatedCustomFields || {};

            let enrichedFormData: ActivityFormData;

            if (activity?.id === 'plano-aula') {
              console.log('📚 Processando dados específicos de Plano de Aula');

              enrichedFormData = {
                title: consolidatedData.personalizedTitle || consolidatedData.title || activity.personalizedTitle || activity.title || '',
                description: consolidatedData.personalizedDescription || consolidatedData.description || activity.personalizedDescription || activity.description || '',
                subject: consolidatedCustomFields['Componente Curricular'] ||
                         consolidatedCustomFields['disciplina'] ||
                         consolidatedCustomFields['Disciplina'] ||
                         'Matemática',
                theme: consolidatedCustomFields['Tema ou Tópico Central'] ||
                       consolidatedCustomFields['Tema Central'] ||
                       consolidatedCustomFields['tema'] ||
                       consolidatedCustomFields['Tema'] || '',
                schoolYear: consolidatedCustomFields['Ano/Série Escolar'] ||
                           consolidatedCustomFields['Público-Alvo'] ||
                           consolidatedCustomFields['anoEscolaridade'] ||
                           consolidatedCustomFields['Ano de Escolaridade'] || '',
                numberOfQuestions: '1',
                difficultyLevel: consolidatedCustomFields['Tipo de Aula'] ||
                                consolidatedCustomFields['Metodologia'] ||
                                consolidatedCustomFields['tipoAula'] || 'Expositiva',
                questionModel: '',
                sources: consolidatedCustomFields['Fontes'] ||
                        consolidatedCustomFields['Referencias'] ||
                        consolidatedCustomFields['fontes'] || '',
                objectives: consolidatedCustomFields['Objetivo Geral'] ||
                           consolidatedCustomFields['Objetivos de Aprendizagem'] ||
                           consolidatedCustomFields['Objetivo Principal'] ||
                           consolidatedCustomFields['objetivos'] || '',
                materials: consolidatedCustomFields['Materiais/Recursos'] ||
                          consolidatedCustomFields['Recursos'] ||
                          consolidatedCustomFields['Materiais Necessários'] ||
                          consolidatedCustomFields['materiais'] || '',
                instructions: consolidatedCustomFields['Instruções'] ||
                             consolidatedCustomFields['Metodologia'] ||
                             consolidatedCustomFields['instrucoes'] || '',
                evaluation: consolidatedCustomFields['Observações do Professor'] ||
                           consolidatedCustomFields['Observações'] ||
                           consolidatedCustomFields['Avaliação'] ||
                           consolidatedCustomFields['observacoes'] || '',
                timeLimit: consolidatedCustomFields['Carga Horária'] ||
                          consolidatedCustomFields['Tempo Estimado'] ||
                          consolidatedCustomFields['tempoLimite'] || '',
                context: consolidatedCustomFields['Perfil da Turma'] ||
                        consolidatedCustomFields['Contexto'] ||
                        consolidatedCustomFields['contexto'] || '',
                textType: '',
                textGenre: '',
                textLength: '',
                associatedQuestions: '',
                competencies: consolidatedCustomFields['Habilidades BNCC'] ||
                             consolidatedCustomFields['Competências'] ||
                             consolidatedCustomFields['competencias'] || '',
                readingStrategies: '',
                visualResources: '',
                practicalActivities: '',
                wordsIncluded: '',
                gridFormat: '',
                providedHints: '',
                vocabularyContext: '',
                language: '',
                associatedExercises: '',
                knowledgeArea: '',
                complexityLevel: '',
                tituloTemaAssunto: consolidatedCustomFields['Título do Tema / Assunto'] || '',
                anoSerie: consolidatedCustomFields['Ano / Série'] || '',
                disciplina: consolidatedCustomFields['Disciplina'] || '',
                bnccCompetencias: consolidatedCustomFields['BNCC / Competências'] || '',
                publicoAlvo: consolidatedCustomFields['Público-alvo'] || '',
                objetivosAprendizagem: consolidatedCustomFields['Objetivos de Aprendizagem'] || '',
                quantidadeAulas: consolidatedCustomFields['Quantidade de Aulas'] || '',
                quantidadeDiagnosticos: consolidatedCustomFields['Quantidade de Diagnósticos'] || '',
                quantidadeAvaliacoes: consolidatedCustomFields['Quantidade de Avaliações'] || '',
                cronograma: consolidatedCustomFields['Cronograma'] || '',
                quadroInterativoCampoEspecifico: consolidatedCustomFields['quadroInterativoCampoEspecifico'] || '',
              };

              console.log('✅ Dados do Plano de Aula processados:', enrichedFormData);
            } else if (activity?.id === 'sequencia-didatica') {
              console.log('📚 Processando dados específicos de Sequência Didática');

              enrichedFormData = {
                ...formData,
                title: consolidatedData.title || autoFormData.title || activity.title || '',
                description: consolidatedData.description || autoFormData.description || activity.description || '',
                tituloTemaAssunto: consolidatedCustomFields['Título do Tema / Assunto'] || autoFormData.tituloTemaAssunto || '',
                anoSerie: consolidatedCustomFields['Ano / Série'] || autoFormData.anoSerie || '',
                disciplina: consolidatedCustomFields['Disciplina'] || autoFormData.disciplina || activity?.customFields?.disciplina || '',
                bnccCompetencias: consolidatedCustomFields['BNCC / Competências'] || autoFormData.bnccCompetencias || '',
                publicoAlvo: consolidatedCustomFields['Público-alvo'] || autoFormData.publicoAlvo || '',
                objetivosAprendizagem: consolidatedCustomFields['Objetivos de Aprendizagem'] || autoFormData.objetivosAprendizagem || '',
                quantidadeAulas: consolidatedCustomFields['Quantidade de Aulas'] || autoFormData.quantidadeAulas || '',
                quantidadeDiagnosticos: consolidatedCustomFields['Quantidade de Diagnósticos'] || autoFormData.quantidadeDiagnosticos || '',
                quantidadeAvaliacoes: consolidatedCustomFields['Quantidade de Avaliações'] || autoFormData.quantidadeAvaliacoes || '',
                cronograma: consolidatedCustomFields['Cronograma'] || autoFormData.cronograma || '',
                subject: consolidatedCustomFields['Disciplina'] || autoFormData.subject || activity?.customFields?.disciplina || 'Português',
                theme: consolidatedCustomFields['Tema'] || autoFormData.theme || activity?.theme || '',
                schoolYear: consolidatedCustomFields['Ano de Escolaridade'] || autoFormData.schoolYear || activity?.schoolYear || '',
                competencies: consolidatedCustomFields['Competências'] || autoFormData.competencies || '',
                objectives: consolidatedCustomFields['Objetivos'] || autoFormData.objectives || activity?.objectives || '',
                materials: consolidatedCustomFields['Materiais'] || autoFormData.materials || activity?.materials || '',
                context: consolidatedCustomFields['Contexto de Aplicação'] || autoFormData.context || '',
                evaluation: consolidatedCustomFields['Critérios de Avaliação'] || autoFormData.evaluation || '',
                quadroInterativoCampoEspecifico: consolidatedCustomFields['quadroInterativoCampoEspecifico'] || autoFormData.quadroInterativoCampoEspecifico || '',
              };

              console.log('✅ Dados da Sequência Didática processados:', enrichedFormData);
            } else if (activity?.id === 'quiz-interativo') {
              console.log('🎯 Processando dados específicos de Quiz Interativo');

              enrichedFormData = {
                ...formData,
                title: consolidatedData.title || autoFormData.title || activity.title || '',
                description: consolidatedData.description || autoFormData.description || activity.description || '',
                numberOfQuestions: consolidatedCustomFields['Número de Questões'] || autoFormData.numberOfQuestions || '10',
                theme: consolidatedCustomFields['Tema'] || autoFormData.theme || activity.theme || '',
                subject: consolidatedCustomFields['Disciplina'] || autoFormData.subject || 'Matemática',
                schoolYear: consolidatedCustomFields['Ano de Escolaridade'] || autoFormData.schoolYear || '6º Ano - Ensino Fundamental',
                difficultyLevel: consolidatedCustomFields['Nível de Dificuldade'] || autoFormData.difficultyLevel || 'Médio',
                questionModel: consolidatedCustomFields['Formato'] || autoFormData.questionModel || 'Múltipla Escolha',
                objectives: consolidatedCustomFields['Objetivos'] || autoFormData.objectives || '',
                materials: consolidatedCustomFields['Materiais'] || autoFormData.materials || '',
                instructions: consolidatedCustomFields['Instruções'] || autoFormData.instructions || '',
                evaluation: consolidatedCustomFields['Critérios de Avaliação'] || autoFormData.evaluation || '',
                timeLimit: consolidatedCustomFields['Tempo Limite'] || autoFormData.timeLimit || '',
                context: consolidatedCustomFields['Contexto de Aplicação'] || autoFormData.context || '',
                format: consolidatedCustomFields['Formato do Quiz'] || autoFormData.format || '', // New field
                timePerQuestion: consolidatedCustomFields['Tempo por Questão'] || autoFormData.timePerQuestion || '', // New field
                quadroInterativoCampoEspecifico: consolidatedCustomFields['quadroInterativoCampoEspecifico'] || autoFormData.quadroInterativoCampoEspecifico || '',
              };

              console.log('🎯 Dados finais do Quiz Interativo processados:', enrichedFormData);

            } else if (activity?.id === 'quadro-interativo') {
              console.log('🖼️ Processando dados específicos de Quadro Interativo');

              // Importar o processador específico do Quadro Interativo
              const { prepareQuadroInterativoDataForModal } = await import('../activities/quadro-interativo/quadroInterativoProcessor');

              // Preparar dados consolidados para o processador
              const activityForProcessor = {
                ...activity,
                ...consolidatedData,
                customFields: {
                  ...activity.customFields,
                  ...consolidatedCustomFields,
                  ...autoCustomFields
                }
              };

              console.log('📋 Dados para processador do Quadro Interativo:', activityForProcessor);

              // Usar o processador específico para preparar os dados
              const processedQuadroData = prepareQuadroInterativoDataForModal(activityForProcessor);

              // Aplicar dados automáticos por cima se existirem
              enrichedFormData = {
                ...processedQuadroData,

                // Sobrescrever com dados automáticos se existirem e forem válidos
                ...(autoFormData.title && { title: autoFormData.title }),
                ...(autoFormData.description && { description: autoFormData.description }),
                ...(autoFormData.subject && autoFormData.subject !== 'Matemática' && { subject: autoFormData.subject }),
                ...(autoFormData.schoolYear && autoFormData.schoolYear !== '6º ano' && { schoolYear: autoFormData.schoolYear }),
                ...(autoFormData.theme && autoFormData.theme !== 'Conteúdo Geral' && { theme: autoFormData.theme }),
                ...(autoFormData.objectives && { objectives: autoFormData.objectives }),
                ...(autoFormData.difficultyLevel && autoFormData.difficultyLevel !== 'Intermediário' && { difficultyLevel: autoFormData.difficultyLevel }),
                ...(autoFormData.quadroInterativoCampoEspecifico && { quadroInterativoCampoEspecifico: autoFormData.quadroInterativoCampoEspecifico }),
                ...(autoFormData.materials && { materials: autoFormData.materials }),
                ...(autoFormData.instructions && { instructions: autoFormData.instructions }),
                ...(autoFormData.evaluation && { evaluation: autoFormData.evaluation }),
                ...(autoFormData.timeLimit && { timeLimit: autoFormData.timeLimit }),
                ...(autoFormData.context && { context: autoFormData.context })
              };

              console.log('🖼️ Dados finais do Quadro Interativo processados:', enrichedFormData);

            } else if (activity?.id === 'mapa-mental') {
              console.log('🧠 Processando dados específicos de Mapa Mental');

              enrichedFormData = {
                ...formData,
                title: activityData.title || autoFormData.title || activity.title || '',
                description: activityData.description || autoFormData.description || activity.description || '',
                centralTheme: customFields['Tema Central'] || autoFormData.centralTheme || activity.customFields?.['Tema Central'] || '',
                mainCategories: customFields['Categorias Principais'] || autoFormData.mainCategories || activity.customFields?.['Categorias Principais'] || '',
                generalObjective: customFields['Objetivo Geral'] || autoFormData.generalObjective || activity.customFields?.['Objetivo Geral'] || activity.description || '',
                evaluationCriteria: customFields['Critérios de Avaliação'] || autoFormData.evaluationCriteria || activity.customFields?.['Critérios de Avaliação'] || ''
              };

              console.log('🧠 Dados finais do Mapa Mental processados:', enrichedFormData);

            }
            else {
              enrichedFormData = {
                title: activityData.title || '',
                description: activityData.description || '',
                subject: customFields['Disciplina'] || customFields['disciplina'] || 'Português',
                theme: customFields['Tema'] || customFields['tema'] || '',
                schoolYear: customFields['Ano de Escolaridade'] || customFields['anoEscolaridade'] || '',
                numberOfQuestions: customFields['Quantidade de Questões'] || customFields['quantidadeQuestoes'] || '10',
                difficultyLevel: customFields['Nível de Dificuldade'] || customFields['nivelDificuldade'] || 'Médio',
                questionModel: customFields['Modelo de Questões'] || customFields['modeloQuestoes'] || '',
                sources: customFields['Fontes'] || customFields['fontes'] || '',
                objectives: customFields['Objetivos'] || customFields['objetivos'] || '',
                materials: customFields['Materiais'] || customFields['materiais'] || '',
                instructions: customFields['Instruções'] || customFields['instrucoes'] || '',
                evaluation: customFields['Critérios de Correção'] || customFields['Critérios de Avaliação'] || '',
                timeLimit: customFields['Tempo de Prova'] || customFields['Tempo Limite'] || '',
                context: customFields['Contexto de Aplicação'] || '',
                textType: '',
                textGenre: '',
                textLength: '',
                associatedQuestions: '',
                competencies: customFields['Competências Trabalhadas'] || '',
                readingStrategies: '',
                visualResources: '',
                practicalActivities: '',
                wordsIncluded: '',
                gridFormat: '',
                providedHints: '',
                vocabularyContext: '',
                language: '',
                associatedExercises: '',
                knowledgeArea: '',
                complexityLevel: '',
                tituloTemaAssunto: customFields['Título do Tema / Assunto'] || '',
                anoSerie: customFields['Ano / Série'] || '',
                disciplina: customFields['Disciplina'] || '',
                bnccCompetencias: customFields['BNCC / Competências'] || '',
                publicoAlvo: customFields['Público-alvo'] || '',
                objetivosAprendizagem: customFields['Objetivos de Aprendizagem'] || '',
                quantidadeAulas: customFields['Quantidade de Aulas'] || '',
                quantidadeDiagnosticos: customFields['Quantidade de Diagnósticos'] || '',
                quantidadeAvaliacoes: customFields['Quantidade de Avaliações'] || '',
                cronograma: customFields['Cronograma'] || '',
                quadroInterativoCampoEspecifico: customFields['quadroInterativoCampoEspecifico'] || '',
              };
            }

            console.log('✅ Formulário será preenchido com:', enrichedFormData);
            setFormData(enrichedFormData);

            if (onUpdateActivity) {
              const activityWithAutoFlag = {
                ...activity,
                preenchidoAutomaticamente: true,
                dataSource: activity?.id === 'plano-aula' ? 'action-plan-plano-aula' : 'action-plan-generic'
              };
              onUpdateActivity(activityWithAutoFlag);
              console.log('🏷️ Atividade marcada como preenchida automaticamente');

              if (activity?.id === 'plano-aula') {
                console.log('📚 Plano de Aula configurado com dados específicos do Action Plan');
              }
            }

            setTimeout(() => {
              localStorage.removeItem(autoDataKey);
              console.log('🗑️ Dados automáticos limpos do localStorage');
            }, 1000);

          } catch (error) {
            console.error('❌ Erro ao carregar dados automáticos:', error);

            const fallbackData = {
              title: activity.title || activity.originalData?.title || '',
              description: activity.description || activity.originalData?.description || '',
              subject: activity.originalData?.customFields?.['Disciplina'] || 'Português',
              theme: activity.originalData?.customFields?.['Tema'] || '',
              schoolYear: activity.originalData?.customFields?.['Ano de Escolaridade'] || '',
              numberOfQuestions: activity.originalData?.customFields?.['Quantidade de Questões'] || '10',
              difficultyLevel: activity.originalData?.customFields?.['Nível de Dificuldade'] || 'Médio',
              questionModel: activity.originalData?.customFields?.['Modelo de Questões'] || '',
              sources: activity.originalData?.customFields?.['Fontes'] || '',
              objectives: '',
              materials: '',
              instructions: '',
              evaluation: '',
              timeLimit: '',
              context: '',
              textType: '',
              textGenre: '',
              textLength: '',
              associatedQuestions: '',
              competencies: '',
              readingStrategies: '',
              visualResources: '',
              practicalActivities: '',
              wordsIncluded: '',
              gridFormat: '',
              providedHints: '',
              vocabularyContext: '',
              language: '',
              associatedExercises: '',
              knowledgeArea: '',
              complexityLevel: '',
              tituloTemaAssunto: '',
              anoSerie: '',
              disciplina: '',
              bnccCompetencias: '',
              publicoAlvo: '',
              objetivosAprendizagem: '',
              quantidadeAulas: '',
              quantidadeDiagnosticos: '',
              quantidadeAvaliacoes: '',
              cronograma: '',
              quadroInterativoCampoEspecifico: '',
              format: '', // Default for Quiz Interativo
              timePerQuestion: '', // Default for Quiz Interativo
            };

            setFormData(fallbackData);
            console.log('🔧 Usando dados de fallback:', fallbackData);
          }
        } else {
          console.log('⚠️ Nenhum dado automático encontrado, usando dados da atividade');

          const activityData = activity.originalData || activity;
          const customFields = activityData.customFields || {};

          console.log('📊 Dados da atividade para preenchimento:', activityData);
          console.log('🗂️ Custom fields disponíveis:', customFields);

          let directFormData: ActivityFormData;

          if (activity?.id === 'plano-aula') {
            console.log('📚 Processando dados diretos de Plano de Aula');

            directFormData = {
              title: activityData.personalizedTitle || activityData.title || '',
              description: activityData.personalizedDescription || activityData.description || '',
              subject: customFields['Componente Curricular'] ||
                       customFields['disciplina'] ||
                       customFields['Disciplina'] ||
                       'Matemática',
              theme: customFields['Tema ou Tópico Central'] ||
                     customFields['Tema Central'] ||
                     customFields['tema'] ||
                     customFields['Tema'] || '',
              schoolYear: customFields['Ano/Série Escolar'] ||
                         customFields['Público-Alvo'] ||
                         customFields['anoEscolaridade'] ||
                         customFields['Ano de Escolaridade'] || '',
              numberOfQuestions: '1',
              difficultyLevel: customFields['Tipo de Aula'] ||
                              customFields['Metodologia'] ||
                              customFields['tipoAula'] || 'Expositiva',
              questionModel: '',
              sources: customFields['Fontes'] || customFields['fontes'] || '',
              objectives: customFields['Objetivo Geral'] ||
                         customFields['Objetivos de Aprendizagem'] ||
                         customFields['Objetivo Principal'] ||
                         customFields['objetivos'] || '',
              materials: customFields['Materiais/Recursos'] ||
                        customFields['Recursos'] ||
                        customFields['Materiais Necessários'] ||
                        customFields['materiais'] || '',
              instructions: customFields['Instruções'] ||
                           customFields['Metodologia'] ||
                           customFields['instrucoes'] || '',
              evaluation: customFields['Observações do Professor'] ||
                         customFields['Observações'] ||
                         customFields['Avaliação'] ||
                         customFields['observacoes'] || '',
              timeLimit: customFields['Carga Horária'] ||
                        customFields['Tempo Estimado'] ||
                        customFields['tempoLimite'] || '',
              context: customFields['Perfil da Turma'] ||
                      customFields['Contexto'] ||
                      customFields['contexto'] || '',
              textType: '',
              textGenre: '',
              textLength: '',
              associatedQuestions: '',
              competencies: customFields['Habilidades BNCC'] ||
                           customFields['Competências'] ||
                           customFields['competencias'] || '',
              readingStrategies: '',
              visualResources: '',
              practicalActivities: '',
              wordsIncluded: '',
              gridFormat: '',
              providedHints: '',
              vocabularyContext: '',
              language: '',
              associatedExercises: '',
              knowledgeArea: '',
              complexityLevel: '',
              tituloTemaAssunto: customFields['Título do Tema / Assunto'] || '',
              anoSerie: customFields['Ano / Série'] || '',
              disciplina: customFields['Disciplina'] || '',
              bnccCompetencias: customFields['BNCC / Competências'] || '',
              publicoAlvo: customFields['Público-alvo'] || '',
              objetivosAprendizagem: customFields['Objetivos de Aprendizagem'] || '',
              quantidadeAulas: customFields['Quantidade de Aulas'] || '',
              quantidadeDiagnosticos: customFields['Quantidade de Diagnósticos'] || '',
              quantidadeAvaliacoes: customFields['Quantidade de Avaliações'] || '',
              cronograma: customFields['Cronograma'] || '',
              quadroInterativoCampoEspecifico: customFields['quadroInterativoCampoEspecifico'] || '',
            };

            console.log('📝 Dados diretos processados para plano-aula:', directFormData);
          } else if (activity?.id === 'sequencia-didatica') {
            console.log('📚 Processando dados diretos de Sequência Didática');

            directFormData = {
              ...formData,
              title: activityData.title || '',
              description: activityData.description || '',
              tituloTemaAssunto: customFields['Título do Tema / Assunto'] || '',
              anoSerie: customFields['Ano / Série'] || '',
              disciplina: customFields['Disciplina'] || '',
              bnccCompetencias: customFields['BNCC / Competências'] || '',
              publicoAlvo: customFields['Público-alvo'] || '',
              objetivosAprendizagem: customFields['Objetivos de Aprendizagem'] || '',
              quantidadeAulas: customFields['Quantidade de Aulas'] || '',
              quantidadeDiagnosticos: customFields['Quantidade de Diagnósticos'] || '',
              quantidadeAvaliacoes: customFields['Quantidade de Avaliações'] || '',
              cronograma: customFields['Cronograma'] || '',
              subject: customFields['Disciplina'] || 'Português',
              theme: customFields['Tema'] || '',
              schoolYear: customFields['Ano de Escolaridade'] || '',
              competencies: customFields['Competências'] || '',
              objectives: customFields['Objetivos'] || '',
              materials: customFields['Materiais'] || '',
              context: customFields['Contexto de Aplicação'] || '',
              evaluation: customFields['Critérios de Avaliação'] || '',
              quadroInterativoCampoEspecifico: customFields['quadroInterativoCampoEspecifico'] || '',
            };

            console.log('✅ Dados da Sequência Didática processados:', directFormData);
          } else if (activity?.id === 'quiz-interativo') {
            console.log('🎯 Processando dados diretos de Quiz Interativo');

            directFormData = {
              ...formData,
              title: activityData.title || '',
              description: activityData.description || '',
              numberOfQuestions: customFields['Número de Questões'] || customFields['quantidadeQuestoes'] || '10',
              theme: customFields['Tema'] || customFields['tema'] || '',
              subject: customFields['Disciplina'] || customFields['disciplina'] || 'Matemática',
              schoolYear: customFields['Ano de Escolaridade'] || customFields['anoEscolaridade'] || '6º Ano - Ensino Fundamental',
              difficultyLevel: customFields['Nível de Dificuldade'] || customFields['nivelDificuldade'] || 'Médio',
              questionModel: customFields['Formato'] || customFields['formato'] || customFields['Modelo de Questões'] || 'Múltipla Escolha',
              objectives: customFields['Objetivos'] || customFields['objetivos'] || '',
              materials: customFields['Materiais'] || customFields['materiais'] || '',
              instructions: customFields['Instruções'] || customFields['instrucoes'] || '',
              evaluation: customFields['Critérios de Avaliação'] || customFields['criteriosAvaliacao'] || '',
              timeLimit: customFields['Tempo Limite'] || customFields['tempoLimite'] || '',
              context: customFields['Contexto de Aplicação'] || customFields['contexto'] || '',
              format: customFields['Formato do Quiz'] || '', // New field
              timePerQuestion: customFields['Tempo por Questão'] || '', // New field
              quadroInterativoCampoEspecifico: customFields['quadroInterativoCampoEspecifico'] || '',
            };

            console.log('🎯 Dados diretos do Quiz Interativo processados:', directFormData);
          } else if (activity?.id === 'quadro-interativo') {
            console.log('🖼️ Processando dados diretos de Quadro Interativo');

            // Usar o processador específico para dados diretos também
            const { prepareQuadroInterativoDataForModal } = await import('../activities/quadro-interativo/quadroInterativoProcessor');

            const processedDirectData = prepareQuadroInterativoDataForModal({
              ...activityData,
              customFields: customFields
            });

            directFormData = {
              ...processedDirectData,
              // Garantir mapeamento completo dos custom fields
              title: activityData.personalizedTitle || activityData.title || processedDirectData.title,
              description: activityData.personalizedDescription || activityData.description || processedDirectData.description,

              subject: customFields['Disciplina / Área de conhecimento'] ||
                       customFields['disciplina'] ||
                       customFields['Disciplina'] ||
                       customFields['Componente Curricular'] ||
                       customFields['Matéria'] ||
                       processedDirectData.subject ||
                       'Matemática',

              schoolYear: customFields['Ano / Série'] ||
                         customFields['anoSerie'] ||
                         customFields['Ano de Escolaridade'] ||
                         customFields['Público-Alvo'] ||
                         customFields['Ano'] ||
                         customFields['Série'] ||
                         processedDirectData.schoolYear ||
                         '6º Ano',

              theme: customFields['Tema ou Assunto da aula'] ||
                     customFields['tema'] ||
                     customFields['Tema'] ||
                     customFields['Assunto'] ||
                     customFields['Tópico'] ||
                     customFields['Tema Central'] ||
                     processedDirectData.theme ||
                     activityData.title ||
                     'Tema da Aula',

              objectives: customFields['Objetivo de aprendizagem da aula'] ||
                          customFields['objetivos'] ||
                          customFields['Objetivos'] ||
                          customFields['Objetivo'] ||
                          customFields['Objetivo Principal'] ||
                          customFields['Objetivos de Aprendizagem'] ||
                          processedDirectData.objectives ||
                          activityData.description ||
                          'Objetivos de aprendizagem',

              difficultyLevel: customFields['Nível de Dificuldade'] ||
                              customFields['nivelDificuldade'] ||
                              customFields['dificuldade'] ||
                              customFields['Dificuldade'] ||
                              customFields['Nível'] ||
                              customFields['Complexidade'] ||
                              processedDirectData.difficultyLevel ||
                              'Intermediário',

              quadroInterativoCampoEspecifico: customFields['Atividade mostrada'] ||
                                              customFields['atividadeMostrada'] ||
                                              customFields['quadroInterativoCampoEspecifico'] ||
                                              customFields['Campo Específico do Quadro Interativo'] ||
                                              customFields['Atividade'] ||
                                              customFields['Atividades'] ||
                                              customFields['Tipo de Atividade'] ||
                                              customFields['Interatividade'] ||
                                              customFields['Campo Específico'] ||
                                              processedDirectData.quadroInterativoCampoEspecifico ||
                                              'Atividade interativa no quadro',

              materials: customFields['Materiais'] ||
                        customFields['Materiais Necessários'] ||
                        customFields['Recursos'] ||
                        customFields['materials'] ||
                        processedDirectData.materials ||
                        '',

              instructions: customFields['Instruções'] ||
                           customFields['Metodologia'] ||
                           customFields['instructions'] ||
                           processedDirectData.instructions ||
                           '',

              evaluation: customFields['Avaliação'] ||
                         customFields['Critérios de Avaliação'] ||
                         customFields['evaluation'] ||
                         processedDirectData.evaluation ||
                         '',

              timeLimit: customFields['Tempo Estimado'] ||
                        customFields['Duração'] ||
                        customFields['timeLimit'] ||
                        processedDirectData.timeLimit ||
                        '',

              context: customFields['Contexto'] ||
                      customFields['Aplicação'] ||
                      customFields['context'] ||
                      processedDirectData.context ||
                      ''
            };

            console.log('🖼️ Dados diretos do Quadro Interativo processados:', directFormData);
          } else if (activity?.id === 'mapa-mental') {
            console.log('🧠 Processando dados diretos de Mapa Mental');

            directFormData = {
              ...formData, // Start with existing formData to merge
              title: activityData.title || autoFormData?.title || activity.title || '',
              description: activityData.description || autoFormData?.description || activity.description || '',
              centralTheme: customFields['Tema Central'] || autoFormData?.centralTheme || activity.customFields?.['Tema Central'] || '',
              mainCategories: customFields['Categorias Principais'] || autoFormData?.mainCategories || activity.customFields?.['Categorias Principais'] || '',
              generalObjective: customFields['Objetivo Geral'] || autoFormData?.generalObjective || activity.customFields?.['Objetivo Geral'] || activity.description || '',
              evaluationCriteria: customFields['Critérios de Avaliação'] || autoFormData?.evaluationCriteria || activity.customFields?.['Critérios de Avaliação'] || ''
            };

            console.log('🧠 Dados diretos do Mapa Mental processados:', directFormData);
          }
          else {
            directFormData = {
              title: activityData.title || '',
              description: activityData.description || '',
              subject: customFields['Disciplina'] || customFields['disciplina'] || 'Português',
              theme: customFields['Tema'] || customFields['tema'] || '',
              schoolYear: customFields['Ano de Escolaridade'] || customFields['anoEscolaridade'] || '',
              numberOfQuestions: customFields['Quantidade de Questões'] || customFields['quantidadeQuestoes'] || '10',
              difficultyLevel: customFields['Nível de Dificuldade'] || customFields['nivelDificuldade'] || 'Médio',
              questionModel: customFields['Modelo de Questões'] || customFields['modeloQuestoes'] || '',
              sources: customFields['Fontes'] || customFields['fontes'] || '',
              objectives: customFields['Objetivos'] || customFields['objetivos'] || '',
              materials: customFields['Materiais'] || customFields['materiais'] || '',
              instructions: customFields['Instruções'] || customFields['instrucoes'] || '',
              evaluation: customFields['Critérios de Correção'] || customFields['Critérios de Avaliação'] || '',
              timeLimit: customFields['Tempo Limite'] || '',
              context: customFields['Contexto de Aplicação'] || '',
              textType: '',
              textGenre: '',
              textLength: '',
              associatedQuestions: '',
              competencies: '',
              readingStrategies: '',
              visualResources: '',
              practicalActivities: '',
              wordsIncluded: '',
              gridFormat: '',
              providedHints: '',
              vocabularyContext: '',
              language: '',
              associatedExercises: '',
              knowledgeArea: '',
              complexityLevel: '',
              tituloTemaAssunto: customFields['Título do Tema / Assunto'] || '',
              anoSerie: customFields['Ano / Série'] || '',
              disciplina: customFields['Disciplina'] || '',
              bnccCompetencias: customFields['BNCC / Competências'] || '',
              publicoAlvo: customFields['Público-alvo'] || '',
              objetivosAprendizagem: customFields['Objetivos de Aprendizagem'] || '',
              quantidadeAulas: customFields['Quantidade de Aulas'] || '',
              quantidadeDiagnosticos: customFields['Quantidade de Diagnósticos'] || '',
              quantidadeAvaliacoes: customFields['Quantidade de Avaliações'] || '',
              cronograma: customFields['Cronograma'] || '',
              quadroInterativoCampoEspecifico: customFields['quadroInterativoCampoEspecifico'] || '',
            };
          }

          setFormData(directFormData);
          console.log('📝 Formulário preenchido com dados diretos:', directFormData);
        }
      }
    };

    loadActivityData();
  }, [activity, isOpen]);

  const handleInputChange = (field: keyof ActivityFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função para construir a atividade
  const handleBuildActivity = useCallback(async () => {
    if (!activity || isBuilding) return;

    console.log('🚀 Iniciando construção da atividade:', activity.title);
    console.log('📊 Dados do formulário:', formData);

    setIsBuilding(true);
    setError(null);
    setBuildProgress(0);

    try {
      const progressTimer = setInterval(() => {
        setBuildProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const activityType = activity.type || activity.id || activity.categoryId;
      console.log('🎯 Tipo de atividade determinado:', activityType);

      const result = await generateActivityContent(activityType, formData);

      clearInterval(progressTimer);
      setBuildProgress(100);

      console.log('✅ Atividade construída com sucesso:', result);

      // Salvar no localStorage para persistência
      const storageKey = `constructed_${activityType}_${activity?.id}`;
      localStorage.setItem(storageKey, JSON.stringify(result));
      console.log('💾 Dados da sequência didática salvos para visualização:', storageKey);

      // Trigger específico para Quadro Interativo
      if (activityType === 'quadro-interativo') {
        console.log('🎯 Disparando evento de construção para Quadro Interativo');

        // Salvar dados específicos do Quadro Interativo
        const quadroData = {
          ...result.data || result,
          isBuilt: true,
          builtAt: new Date().toISOString(),
          generatedByModal: true
        };

        localStorage.setItem(`quadro_interativo_data_${activity?.id}`, JSON.stringify(quadroData));

        // Disparar evento customizado para notificar o Preview
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('quadro-interativo-auto-build', {
            detail: { activityId: activity?.id, data: quadroData }
          }));
          console.log('📡 Evento de auto-build disparado para Quadro Interativo');
        }, 100);
      }

      // Trigger específico para Quiz Interativo
      if (activityType === 'quiz-interativo') {
        console.log('🎯 Processamento específico concluído para Quiz Interativo');

        // Garantir que o conteúdo específico também seja definido
        const quizData = result.data || result;
        setQuizInterativoContent(quizData);

        console.log('💾 Quiz Interativo processado e salvo:', quizData);
      }

      // Handle Mapa Mental generation if needed
      if (activityType === 'mapa-mental') {
        console.log('🧠 Processamento específico concluído para Mapa Mental');
        // Save Mapa Mental specific data if necessary
        localStorage.setItem(`constructed_mapa-mental_${activity?.id}`, JSON.stringify(result));
      }


      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivities[activity.id] = {
        generatedContent: result,
        timestamp: new Date().toISOString(),
        activityType: activityType
      };
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

      setGeneratedContent(result);
      setBuiltContent(result);
      setIsContentLoaded(true);
      setActiveTab('preview');

      toast({
        title: "Atividade construída!",
        description: "Sua atividade foi gerada com sucesso pela IA do Gemini.",
      });

    } catch (error) {
      console.error('❌ Erro na construção:', error);
      setError(`Erro ao construir atividade: ${error.message}`);

      toast({
        title: "Erro na construção",
        description: "Houve um problema ao gerar sua atividade. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsBuilding(false);
      setBuildProgress(0);
    }
  }, [activity, formData, isBuilding, toast]);

  // Automação da Construção de Atividades - será chamada externamente
  useEffect(() => {
    if (!activity || !isOpen) return;

    const customFields = activity.customFields || {};

    const preenchidoPorIA = activity.preenchidoAutomaticamente === true ||
                           Object.keys(customFields).length > 0;

    const isFormValid = isFormValidForBuild();

    // Verificação específica para Quadro Interativo
    const isQuadroInterativo = activity.id === 'quadro-interativo';
    const hasQuadroInterativoData = isQuadroInterativo && (
      (formData.subject && formData.subject !== 'Matemática') ||
      (formData.schoolYear && formData.schoolYear !== '6º Ano') ||
      (formData.theme && formData.theme !== '') ||
      (formData.objectives && formData.objectives !== '') ||
      (formData.difficultyLevel && formData.difficultyLevel !== 'Intermediário') ||
      (formData.quadroInterativoCampoEspecifico && formData.quadroInterativoCampoEspecifico !== '')
    );

    // Verificação específica para Quiz Interativo
    const isQuizInterativo = activity.id === 'quiz-interativo';
    const hasQuizInterativoData = isQuizInterativo && (
      (formData.subject && formData.subject !== 'Matemática') ||
      (formData.schoolYear && formData.schoolYear !== '6º Ano - Ensino Fundamental') ||
      (formData.theme && formData.theme !== '') ||
      (formData.numberOfQuestions && formData.numberOfQuestions !== '10') ||
      (formData.difficultyLevel && formData.difficultyLevel !== 'Médio') ||
      (formData.questionModel && formData.questionModel !== 'Múltipla Escolha') ||
      (formData.format && formData.format !== '') || // Check new fields
      (formData.timePerQuestion && formData.timePerQuestion !== '') // Check new fields
    );

    // Verificação específica para Mapa Mental
    const isMapaMental = activity.id === 'mapa-mental';
    const hasMapaMentalData = isMapaMental && (
      (formData.centralTheme && formData.centralTheme !== '') ||
      (formData.generalObjective && formData.generalObjective !== '') ||
      (formData.mainCategories && formData.mainCategories !== '')
    );

    if (isFormValid && preenchidoPorIA && !activity.isBuilt) {
      console.log('🤖 Agente Interno de Execução: Detectados campos preenchidos pela IA e formulário válido');

      if (isQuadroInterativo) {
        console.log('🖼️ Processamento específico para Quadro Interativo detectado');
        console.log('📊 Estado dos dados do Quadro Interativo:', {
          subject: formData.subject,
          schoolYear: formData.schoolYear,
          theme: formData.theme,
          objectives: formData.objectives,
          difficultyLevel: formData.difficultyLevel,
          quadroInterativoCampoEspecifico: formData.quadroInterativoCampoEspecifico,
          hasQuadroInterativoData
        });
      } else if (isQuizInterativo) {
        console.log('🎯 Processamento específico para Quiz Interativo detectado');
        console.log('📊 Estado dos dados do Quiz Interativo:', {
          subject: formData.subject,
          schoolYear: formData.schoolYear,
          theme: formData.theme,
          numberOfQuestions: formData.numberOfQuestions,
          difficultyLevel: formData.difficultyLevel,
          questionModel: formData.questionModel,
          format: formData.format,
          timePerQuestion: formData.timePerQuestion,
          hasQuizInterativoData
        });
      } else if (isMapaMental) {
        console.log('🧠 Processamento específico para Mapa Mental detectado');
        console.log('📊 Estado dos dados do Mapa Mental:', {
          centralTheme: formData.centralTheme,
          generalObjective: formData.generalObjective,
          mainCategories: formData.mainCategories,
          hasMapaMentalData
        });
      }

      console.log('🎯 Acionando construção automática da atividade...');

      const timer = setTimeout(async () => {
        if (isQuizInterativo) {
          console.log('🎯 Auto-build específico para Quiz Interativo');
          await handleGenerateQuizInterativo(); // Use the specific function for Quiz
        } else if (isMapaMental) {
          console.log('🧠 Auto-build específico para Mapa Mental');
          await handleBuildActivity(); // Use the generic build function for Mapa Mental
        }
        else {
          console.log('🏗️ Auto-build genérico para outras atividades');
          await handleBuildActivity(); // Use the generic build function
        }
        console.log('✅ Atividade construída automaticamente pelo agente interno');
      }, isQuizInterativo ? 800 : (isQuadroInterativo ? 500 : (isMapaMental ? 500 : 300))); // Increased delay for Quiz/MapaMental for API call

      return () => clearTimeout(timer);
    }
  }, [formData, activity, isOpen, handleBuildActivity, handleGenerateQuizInterativo, isFormValidForBuild]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 dark:bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 max-w-7xl w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
              {(() => {
                  const ActivityIcon = getActivityIcon(activity?.id || '');
                  return <ActivityIcon className="w-6 h-6" />;
                })()}
                <div>
                  <h2 className="text-xl font-bold">Editar Materiais - {activity?.title}</h2>
                  <p className="text-orange-100 text-sm">Configure os materiais e gere o conteúdo da atividade</p>
                </div>
              </div>

              <div className="flex items-center gap-1 mr-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('editar')}
                  className={`text-white hover:bg-white/20 rounded-lg px-3 py-2 transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'editar' ? 'bg-white/20 shadow-md' : ''
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="font-medium text-sm">Editar</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('preview')}
                  className={`text-white hover:bg-white/20 rounded-lg px-3 py-2 transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'preview' ? 'bg-white/20 shadow-md' : ''
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span className="font-medium text-sm">Pré-visualização</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 h-[calc(800px-180px)] overflow-hidden">
            {activeTab === 'editar' && (
            <div className="flex gap-6 h-full">
              <div className="flex flex-col space-y-4 overflow-y-auto flex-1 pr-2">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-[#FF6B00]" />
                      Informações da Atividade
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title" className="text-sm">Título da Atividade</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Digite o título da atividade"
                          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-sm">Descrição</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Descreva a atividade..."
                          className="mt-1 min-h-[80px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                      </div>

                      {/* Renderização condicional dos componentes de edição */}
                      {(() => {
                        const activityType = activity?.id || '';

                        return (
                          <>
                            {/* Campos Genéricos */}
                            {(activityType !== 'sequencia-didatica' && activityType !== 'plano-aula' && activityType !== 'quadro-interativo' && activityType !== 'quiz-interativo' && activityType !== 'mapa-mental') && (
                              <DefaultEditActivity formData={formData} onFieldChange={handleInputChange} />
                            )}

                            {/* Campos Específicos Sequência Didática */}
                            {activityType === 'sequencia-didatica' && (
                              <SequenciaDidaticaEditActivity formData={formData} onFieldChange={handleInputChange} />
                            )}

                            {/* Campos Específicos Plano de Aula */}
                            {activityType === 'plano-aula' && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="subject">Componente Curricular *</Label>
                                    <Input
                                      id="subject"
                                      value={formData.subject || ''}
                                      onChange={(e) => handleInputChange('subject', e.target.value)}
                                      placeholder="Ex: Matemática"
                                      required
                                      className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="theme">Tema ou Tópico Central *</Label>
                                    <Input
                                      id="theme"
                                      value={formData.theme || ''}
                                      onChange={(e) => handleInputChange('theme', e.target.value)}
                                      placeholder="Ex: Equações de 1º Grau"
                                      required
                                      className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="schoolYear">Ano/Série Escolar *</Label>
                                    <Input
                                      id="schoolYear"
                                      value={formData.schoolYear || ''}
                                      onChange={(e) => handleInputChange('schoolYear', e.target.value)}
                                      placeholder="Ex: 9º Ano Fundamental"
                                      required
                                      className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="competencies">Habilidades BNCC</Label>
                                    <Input
                                      id="competencies"
                                      value={formData.competencies || ''}
                                      onChange={(e) => handleInputChange('competencies', e.target.value)}
                                      placeholder="Ex: EF09MA10, EF09MA11"
                                      className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label htmlFor="objectives">Objetivo Geral *</Label>
                                  <Textarea
                                    id="objectives"
                                    value={formData.objectives || ''}
                                    onChange={(e) => handleInputChange('objectives', e.target.value)}
                                    placeholder="Objetivo principal do plano de aula..."
                                    rows={3}
                                    required
                                    className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="materials">Materiais/Recursos *</Label>
                                  <Textarea
                                    id="materials"
                                    value={formData.materials || ''}
                                    onChange={(e) => handleInputChange('materials', e.target.value)}
                                    placeholder="Lista de materiais necessários (um por linha)..."
                                    rows={3}
                                    required
                                    className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="context">Perfil da Turma / Contexto *</Label>
                                  <Textarea
                                    id="context"
                                    value={formData.context || ''}
                                    onChange={(e) => handleInputChange('context', e.target.value)}
                                    placeholder="Descrição do perfil da turma e contexto da aula..."
                                    rows={2}
                                    required
                                    className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="timeLimit">Carga Horária / Tempo Estimado</Label>
                                    <Input
                                      id="timeLimit"
                                      value={formData.timeLimit || ''}
                                      onChange={(e) => handleInputChange('timeLimit', e.target.value)}
                                      placeholder="Ex: 2 aulas de 50 minutos"
                                      className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="difficultyLevel">Tipo de Aula / Metodologia</Label>
                                    <Select value={formData.difficultyLevel} onValueChange={(value) => handleInputChange('difficultyLevel', value)}>
                                      <SelectTrigger className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500">
                                        <SelectValue placeholder="Selecione o tipo de aula" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Expositiva">Aula Expositiva</SelectItem>
                                        <SelectItem value="Debate">Debate</SelectItem>
                                        <SelectItem value="Estudo de Caso">Estudo de Caso</SelectItem>
                                        <SelectItem value="Resolução de Problemas">Resolução de Problemas</SelectItem>
                                        <SelectItem value="Outro">Outro</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div>
                                  <Label htmlFor="evaluation">Observações do Professor / Avaliação</Label>
                                  <Textarea
                                    id="evaluation"
                                    value={formData.evaluation || ''}
                                    onChange={(e) => handleInputChange('evaluation', e.target.value)}
                                    placeholder="Observações relevantes para a aula ou critérios de avaliação..."
                                    rows={2}
                                    className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Campos Específicos Quiz Interativo */}
                            {activityType === 'quiz-interativo' && (
                              <QuizInterativoEditActivity formData={formData} onFieldChange={handleInputChange} />
                            )}

                            {/* Campos Específicos Quadro Interativo */}
                            {activityType === 'quadro-interativo' && (
                              <QuadroInterativoEditActivity formData={formData} onFieldChange={handleInputChange} />
                            )}

                            {/* Campos Específicos Lista de Exercícios */}
                            {activityType === 'lista-exercicios' && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="numberOfQuestions">Número de Questões</Label>
                                    <Input
                                      id="numberOfQuestions"
                                      value={formData.numberOfQuestions}
                                      onChange={(e) => handleInputChange('numberOfQuestions', e.target.value)}
                                      placeholder="Ex: 10"
                                      className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="difficultyLevel">Nível de Dificuldade</Label>
                                    <Select value={formData.difficultyLevel} onValueChange={(value) => handleInputChange('difficultyLevel', value)}>
                                      <SelectTrigger className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500">
                                        <SelectValue placeholder="Selecione a dificuldade" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Fácil">Fácil</SelectItem>
                                        <SelectItem value="Médio">Médio</SelectItem>
                                        <SelectItem value="Difícil">Difícil</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div>
                                  <Label htmlFor="questionModel">Modelo de Questões</Label>
                                  <Input
                                    id="questionModel"
                                    value={formData.questionModel}
                                    onChange={(e) => handleInputChange('questionModel', e.target.value)}
                                    placeholder="Ex: Múltipla escolha, discursivas..."
                                    className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="sources">Fontes</Label>
                                  <Textarea
                                    id="sources"
                                    value={formData.sources}
                                    onChange={(e) => handleInputChange('sources', e.target.value)}
                                    placeholder="Fontes utilizadas para criar as questões..."
                                    rows={3}
                                    className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="objectives">Objetivos</Label>
                                  <Textarea
                                    id="objectives"
                                    value={formData.objectives}
                                    onChange={(e) => handleInputChange('objectives', e.target.value)}
                                    placeholder="Objetivos da lista de exercícios..."
                                    rows={3}
                                    className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="materials">Materiais</Label>
                                  <Textarea
                                    id="materials"
                                    value={formData.materials}
                                    onChange={(e) => handleInputChange('materials', e.target.value)}
                                    placeholder="Materiais necessários..."
                                    rows={2}
                                    className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="timeLimit">Tempo Limite</Label>
                                    <Input
                                      id="timeLimit"
                                      value={formData.timeLimit}
                                      onChange={(e) => handleInputChange('timeLimit', e.target.value)}
                                      placeholder="Ex: 60 minutos"
                                      className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="context">Contexto de Aplicação</Label>
                                    <Input
                                      id="context"
                                      value={formData.context}
                                      onChange={(e) => handleInputChange('context', e.target.value)}
                                      placeholder="Ex: Prova final, atividade em sala..."
                                      className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Campos Específicos Mapa Mental */}
                            {activityType === 'mapa-mental' && (
                              <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="tema-central">Tema Central</Label>
                                    <Input
                                      id="tema-central"
                                      name="central_theme"
                                      data-field="central_theme"
                                      value={formData.centralTheme || ''}
                                      onChange={(e) => handleInputChange('centralTheme', e.target.value)}
                                      placeholder="Ex: Revolução Francesa"
                                      className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="categorias-principais">Categorias Principais</Label>
                                    <Textarea
                                      id="categorias-principais"
                                      name="branches"
                                      data-field="branches"
                                      value={formData.mainCategories || ''}
                                      onChange={(e) => handleInputChange('mainCategories', e.target.value)}
                                      placeholder="Ex: Causas, Fases, Consequências"
                                      rows={3}
                                      className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="objetivo-geral">Objetivo Geral</Label>
                                    <Textarea
                                      id="objetivo-geral"
                                      name="objectives"
                                      data-field="objectives"
                                      value={formData.generalObjective || ''}
                                      onChange={(e) => handleInputChange('generalObjective', e.target.value)}
                                      placeholder="Descreva o objetivo geral do mapa mental..."
                                      rows={3}
                                      className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="criterios-avaliacao">Critérios de Avaliação</Label>
                                    <Textarea
                                      id="criterios-avaliacao"
                                      name="evaluation_criteria"
                                      data-field="evaluation_criteria"
                                      value={formData.evaluationCriteria || ''}
                                      onChange={(e) => handleInputChange('evaluationCriteria', e.target.value)}
                                      placeholder="Descreva os critérios de avaliação..."
                                      rows={3}
                                      className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                  </div>
                                </>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  id="build-activity-button"
                  data-testid="build-activity-button"
                  onClick={() => {
                    const activityType = activity?.id || '';
                    if (activityType === 'quiz-interativo') {
                      handleGenerateQuizInterativo();
                    } else {
                      handleBuildActivity();
                    }
                  }}
                  disabled={isBuilding || isGeneratingQuiz || !isFormValidForBuild()}
                  className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBuilding || isGeneratingQuiz ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isGeneratingQuiz ? 'Gerando Quiz...' : (activity?.id === 'quiz-interativo' ? 'Gerando Quiz...' : 'Gerando Atividade...')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {activity?.id === 'quiz-interativo' ? 'Gerar Quiz com IA' : 'Construir Atividade'}
                    </>
                  )}
                </Button>
              </div>
            </div>
            )}

            {activeTab === 'preview' && (
              <div className="h-full">
                <div className="border rounded-lg h-full overflow-hidden bg-white dark:bg-gray-800">
                  {isContentLoaded && (generatedContent || quizInterativoContent || (activity?.id === 'mapa-mental' && formData)) ? ( // Check for Mapa Mental specific data
                    activity?.id === 'plano-aula' ? (
                      <PlanoAulaPreview
                        data={generatedContent}
                        activityData={activity}
                      />
                    ) : activity?.id === 'lista-exercicios' ? (
                      <ExerciseListPreview
                        data={processExerciseListData(formData, generatedContent)}
                        content={generatedContent}
                        activityData={activity}
                        onRegenerateContent={handleRegenerateContent}
                      />
                    ) : activity?.id === 'sequencia-didatica' ? (
                      <SequenciaDidaticaPreview
                        data={generatedContent || formData}
                      />
                    ) : activity?.id === 'quadro-interativo' ? (
                      <QuadroInterativoPreview
                        data={generatedContent?.data || generatedContent || formData}
                        activityData={activity}
                      />
                    ) : activity?.id === 'quiz-interativo' ? (
                      <QuizInterativoPreview // Use the specific preview component for Quiz Interativo
                        content={quizInterativoContent || generatedContent}
                        isLoading={isGeneratingQuiz}
                      />
                    ) : activity?.id === 'mapa-mental' ? ( // Preview for Mapa Mental
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-4">Visualização do Mapa Mental</h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Título:</strong> {formData.title}</p>
                        <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Descrição:</strong> {formData.description}</p>
                        <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Tema Central:</strong> {formData.centralTheme}</p>
                        <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Categorias Principais:</strong> {formData.mainCategories}</p>
                        <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Objetivo Geral:</strong> {formData.generalObjective}</p>
                        <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Critérios de Avaliação:</strong> {formData.evaluationCriteria}</p>
                        {/* Add a placeholder or actual rendering for the mind map itself if available */}
                        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                          <p className="text-gray-600 dark:text-gray-400 italic">
                            (Aqui seria renderizado o mapa mental visualmente. Este é um placeholder.)
                          </p>
                        </div>
                      </div>
                    ) : (
                      <ActivityPreview
                        content={generatedContent || formData}
                        activityData={activity}
                      />
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <FileText className="h-16 w-16 text-gray-400 mb-4" />
                      <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Nenhuma atividade gerada ainda
                      </h4>
                      <p className="text-gray-500 dark:text-gray-500 mb-4">
                        Preencha os campos na aba "Editar" e clique em "Construir Atividade" para gerar o conteúdo
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('editar')}
                        className="text-[#FF6B00] border-[#FF6B00] hover:bg-[#FF6B00] hover:text-white"
                      >
                        Ir para Edição
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isGenerating || isGeneratingQuiz}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4 mr-2" />
            Fechar
          </Button>
            {(generatedContent || quizInterativoContent || (activity?.id === 'mapa-mental' && formData)) && ( // Include condition for Mapa Mental
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Determine which content to copy
                    const contentToCopy = activity?.id === 'quiz-interativo' ? quizInterativoContent :
                                          activity?.id === 'mapa-mental' ? formData : // Copy form data for Mapa Mental
                                          generatedContent;
                    if (contentToCopy) {
                      navigator.clipboard.writeText(JSON.stringify(contentToCopy, null, 2));
                      toast({
                        title: "Conteúdo copiado!",
                        description: "O conteúdo da pré-visualização foi copiado para a área de transferência.",
                      });
                    }
                  }}
                  className="px-4 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Copy className="h-4 w-4 mr-2" /> Copiar Conteúdo
                </Button>
              </>
            )}
             {(generatedContent || quizInterativoContent || (activity?.id === 'mapa-mental' && formData)) && ( // Include condition for Mapa Mental
              <Button
                variant="outline"
                onClick={() => {
                  clearContent(); // Clear generic content
                  setQuizInterativoContent(null); // Clear specific quiz content
                  // Clear specific content for Mapa Mental if any state is used
                  if (activity?.id === 'mapa-mental') {
                     setFormData(prev => ({
                       ...prev,
                       centralTheme: '',
                       mainCategories: '',
                       generalObjective: '',
                       evaluationCriteria: ''
                     }));
                  }
                  setIsContentLoaded(false); // Reset content loaded state
                  toast({
                    title: "Conteúdo Limpo",
                    description: "Todo o conteúdo gerado foi removido.",
                  });
                }}
                className="px-4 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Limpar Conteúdo
              </Button>
            )}
            <Button
              onClick={handleSave}
              className="px-6 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-semibold"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditActivityModal;
export { EditActivityModal };
import React, { useState, useEffect, useCallback } from 'react';
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
import FlashCardsPreview from '@/features/schoolpower/activities/flash-cards/FlashCardsPreview';
import { CheckCircle2 } from 'lucide-react';
import generateActivityContent from './generateActivityContent';

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

  // Estados do formulário
  const [formData, setFormData] = useState<ActivityFormData>({
    title: activity?.title || activity?.personalizedTitle || '',
    description: activity?.description || activity?.personalizedDescription || '',
    subject: activity?.customFields?.disciplina || '',
    theme: activity?.customFields?.tema || activity?.personalizedTitle || activity?.title || '',
    schoolYear: activity?.customFields?.anoEscolaridade || '',
    numberOfQuestions: activity?.customFields?.nivelDificuldade?.toLowerCase() || 'medium',
    difficultyLevel: activity?.customFields?.tempoLimite || '',
    questionModel: '',
    sources: '',
    objectives: activity?.description || activity?.personalizedDescription || '',
    materials: activity?.customFields?.fontes || '',
    instructions: activity?.customFields?.contextoAplicacao || '',
    evaluation: activity?.customFields?.modeloQuestoes || '',
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
    // Campos específicos para sequencia-didatica
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
    // Campos específicos para quadro-interativo
    quadroInterativoCampoEspecifico: activity?.customFields?.quadroInterativoCampoEspecifico || '',
    // Campos específicos para quiz-interativo
    format: '',
    timePerQuestion: '',
    // Campos específicos para mapa-mental
    centralTheme: '',
    mainCategories: '',
    generalObjective: '',
    evaluationCriteria: '',
    // Campos específicos para Flash Cards (novo)
    topicos: '',
    numberOfFlashcards: '10',
  });

  // Estado para conteúdo gerado
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [quizInterativoContent, setQuizInterativoContent] = useState<any>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [flashCardsContent, setFlashCardsContent] = useState<any>(null);
  const [isGeneratingFlashCards, setIsGeneratingFlashCards] = useState(false);

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
    } else if (activityType === 'mapa-mental') { // Validar campos específicos do Mapa Mental
      return formData.title.trim() &&
             formData.centralTheme?.trim() &&
             formData.mainCategories?.trim() &&
             formData.generalObjective?.trim() &&
             formData.evaluationCriteria?.trim();
    } else if (activityType === 'flash-cards') { // Validar campos específicos do Flash Cards
      return formData.title.trim() &&
             formData.theme?.trim() &&
             formData.topicos?.trim() &&
             formData.numberOfFlashcards?.trim() &&
             parseInt(formData.numberOfFlashcards) > 0;
    }
    else {
      return formData.title.trim() &&
             formData.description.trim() &&
             formData.objectives.trim();
    }
  }, [formData, activity?.id]);

  // --- Funções de Geração Específica ---

  // Função para gerar conteúdo do Flash Cards
  const handleGenerateFlashCards = async () => {
    console.log('🃏 Iniciando geração de Flash Cards...');
    console.log('📋 Dados do formulário:', formData);

    try {
      setIsGeneratingFlashCards(true);
      setGenerationError(null);

      // Validar dados obrigatórios
      if (!formData.title?.trim()) {
        throw new Error('Título é obrigatório');
      }
      if (!formData.theme?.trim()) {
        throw new Error('Tema é obrigatório');
      }
      if (!formData.topicos?.trim()) {
        throw new Error('Tópicos são obrigatórios');
      }

      console.log('✅ Validação passou, preparando dados para API...');

      // Importar o gerador do Flash Cards
      const { FlashCardsGenerator } = await import('@/features/schoolpower/activities/flash-cards/FlashCardsGenerator');

      // Preparar dados estruturados para o gerador
      const flashCardsData = {
        title: formData.title?.trim() || 'Flash Cards',
        description: formData.description?.trim() || `Flash Cards sobre ${formData.theme}`,
        theme: formData.theme?.trim() || 'Tema Geral',
        topicos: formData.topicos?.trim() || 'Tópicos gerais',
        numberOfFlashcards: formData.numberOfFlashcards?.trim() || '10',
        context: formData.context?.trim() || 'Contexto educacional geral'
      };

      console.log('🔄 Gerando Flash Cards com dados:', flashCardsData);

      // Criar instância do gerador e gerar conteúdo
      const generator = new FlashCardsGenerator();
      const generatedContent = await generator.generateFlashCardsContent(flashCardsData);

      console.log('📦 Conteúdo gerado pela API:', generatedContent);

      // Validar conteúdo gerado
      if (!generatedContent || !generatedContent.cards || !Array.isArray(generatedContent.cards) || generatedContent.cards.length === 0) {
        throw new Error('Nenhum flash card válido foi gerado pela API');
      }

      // Verificar estrutura dos cards
      const validCards = generatedContent.cards.every(card => 
        card && 
        typeof card.question === 'string' && card.question.trim() &&
        typeof card.answer === 'string' && card.answer.trim()
      );

      if (!validCards) {
        throw new Error('Cards gerados têm estrutura inválida');
      }

      console.log('✅ Validação dos cards passou, estruturando dados finais...');

      // Preparar conteúdo final com validação completa
      const finalContent = {
        title: formData.title,
        description: formData.description || generatedContent.description,
        theme: formData.theme,
        topicos: formData.topicos,
        numberOfFlashcards: generatedContent.cards.length,
        context: formData.context,
        cards: generatedContent.cards.map((card, index) => ({
          id: card.id || index + 1,
          question: card.question.trim(),
          answer: card.answer.trim(),
          category: card.category || formData.theme || 'Geral'
        })),
        totalCards: generatedContent.cards.length,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true,
        isFallback: false
      };

      console.log('📋 Conteúdo final estruturado:', finalContent);

      // Salvar em múltiplas chaves para garantir acesso
      const flashCardsStorageKey = `constructed_flash-cards_${activity?.id || 'flash-cards'}`;
      const genericFlashCardsKey = 'constructed_flash-cards_flash-cards';
      const fallbackKey = 'flash-cards-data';

      const storageData = {
        success: true,
        data: finalContent,
        timestamp: Date.now(),
        source: 'EditActivityModal-Generate'
      };

      // Salvar dados em múltiplas localizações
      localStorage.setItem(flashCardsStorageKey, JSON.stringify(storageData));
      localStorage.setItem(genericFlashCardsKey, JSON.stringify(storageData));
      localStorage.setItem(fallbackKey, JSON.stringify(storageData));

      // Salvar também em constructedActivities
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      const activityKey = `flash-cards_${activity?.id || Date.now()}`;
      constructedActivities[activityKey] = {
        activityType: 'flash-cards',
        generatedContent: finalContent,
        timestamp: Date.now(),
        source: 'EditActivityModal-Generate'
      };
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

      console.log('💾 Flash Cards salvo em múltiplas localizações:', {
        specificKey: flashCardsStorageKey,
        genericKey: genericFlashCardsKey,
        fallbackKey: fallbackKey,
        constructedKey: activityKey,
        dataStructure: finalContent
      });

      // APLICAR DADOS IMEDIATAMENTE nos estados locais
      setFlashCardsContent(finalContent);
      setGeneratedContent(finalContent);
      setIsContentLoaded(true);

      // Forçar atualização com deep clone para garantir reatividade
      setTimeout(() => {
        const clonedContent = JSON.parse(JSON.stringify(finalContent));
        setFlashCardsContent(clonedContent);
        setGeneratedContent(clonedContent);
        console.log('🔄 Estados atualizados com clone:', clonedContent);
      }, 50);

      console.log('🎯 Estados locais atualizados:', {
        flashCardsContent: !!flashCardsContent,
        generatedContent: !!generatedContent,
        isContentLoaded,
        finalContent
      });

      // Disparar eventos para notificar outros componentes
      const eventDetail = { 
        activityId: activity?.id || 'flash-cards', 
        data: finalContent,
        source: 'EditActivityModal-Generate',
        timestamp: new Date().toISOString()
      };

      const eventTypes = [
        'flash-cards-auto-build',
        'activity-auto-built', 
        'flash-cards-generated',
        'flash-cards-content-ready'
      ];

      // Disparar eventos IMEDIATAMENTE
      eventTypes.forEach(eventType => {
        window.dispatchEvent(new CustomEvent(eventType, { detail: eventDetail }));
      });

      console.log('📡 Eventos imediatos disparados:', eventTypes);

      // Backup de eventos com delay
      setTimeout(() => {
        eventTypes.forEach(eventType => {
          window.dispatchEvent(new CustomEvent(eventType, { detail: eventDetail }));
        });
        console.log('📡 Eventos de backup disparados');
      }, 100);

      // Verificação final após delay
      setTimeout(() => {
        const verification = {
          localStorage: {
            specificKey: !!localStorage.getItem(flashCardsStorageKey),
            genericKey: !!localStorage.getItem(genericFlashCardsKey),
            fallbackKey: !!localStorage.getItem(fallbackKey),
            constructedActivities: !!localStorage.getItem('constructedActivities')
          },
          state: {
            flashCardsContent: !!flashCardsContent,
            generatedContent: !!generatedContent,
            isContentLoaded
          }
        };
        console.log('🔍 Verificação final dos dados:', verification);
      }, 200);

      // Mudar para aba de preview
      setActiveTab('preview');

      toast({
        title: "Flash Cards Gerados com Sucesso!",
        description: `${finalContent.cards.length} cards foram gerados pela IA do Gemini.`,
      });

    } catch (error) {
      console.error('❌ Erro ao gerar Flash Cards:', error);
      setGenerationError(`Erro ao gerar flash cards: ${error.message}`);

      // Criar conteúdo de fallback mais robusto
      const numberOfCards = parseInt(formData.numberOfFlashcards) || 5;
      const topicsList = formData.topicos ? formData.topicos.split(',').map(t => t.trim()) : ['Conceitos básicos'];

      const fallbackContent = {
        title: formData.title || `Flash Cards: ${formData.theme}`,
        description: formData.description || `Flash Cards sobre ${formData.theme} (Modo Demonstração)`,
        theme: formData.theme || 'Tema Geral',
        topicos: formData.topicos || 'Tópicos gerais',
        numberOfFlashcards: numberOfCards,
        context: formData.context || 'Contexto educacional',
        cards: Array.from({ length: numberOfCards }, (_, index) => {
          const topic = topicsList[index % topicsList.length];
          return {
            id: index + 1,
            question: `O que você sabe sobre ${topic} em ${formData.theme}?`,
            answer: `${topic} é um conceito importante em ${formData.theme}. ${formData.context ? `No contexto: ${formData.context}` : 'É fundamental para o entendimento do tema.'}`,
            category: formData.theme || 'Geral'
          };
        }),
        totalCards: numberOfCards,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: false,
        isFallback: true
      };

      console.log('🛡️ Usando conteúdo de fallback robusto:', fallbackContent);

      const fallbackClone = JSON.parse(JSON.stringify(fallbackContent));

      setFlashCardsContent(fallbackClone);
      setGeneratedContent(fallbackClone);
      setIsContentLoaded(true);
      setActiveTab('preview');

      toast({
        title: "Flash Cards Criados (Modo Demonstração)",
        description: "Foi criado um exemplo de flash cards. Verifique a configuração da API para gerar conteúdo personalizado.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFlashCards(false);
    }
  };

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

      // Force update para garantir reatividade
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
      const flashCardsSavedContent = localStorage.getItem(`constructed_flash-cards_${activity.id}`); // New: Load Flash Cards content

      console.log(`🔎 Estado do localStorage:`, {
        constructedActivities: Object.keys(constructedActivities),
        hasSavedContent: !!savedContent,
        hasPlanoAulaSavedContent: !!planoAulaSavedContent,
        hasSequenciaDidaticaSavedContent: !!sequenciaDidaticaSavedContent,
        hasQuadroInterativoSavedContent: !!quadroInterativoSavedContent,
        hasQuadroInterativoSpecificData: !!quadroInterativoSpecificData,
        hasQuizInterativoSavedContent: !!quizInterativoSavedContent,
        hasFlashCardsSavedContent: !!flashCardsSavedContent,
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
      } else if (activity.id === 'flash-cards' && flashCardsSavedContent) { // Check for Flash Cards content
        try {
          const parsedContent = JSON.parse(flashCardsSavedContent);
          contentToLoad = parsedContent.data || parsedContent; // Handle both wrapped and direct data

          // Validar se o conteúdo tem cards
          if (contentToLoad && contentToLoad.cards && contentToLoad.cards.length > 0) {
            console.log(`✅ Conteúdo específico do Flash Cards encontrado para: ${activity.id}`, contentToLoad);
            console.log(`🃏 ${contentToLoad.cards.length} cards carregados`);

            // CRITICAL: Garantir sincronização imediata
            const flashContentClone = JSON.parse(JSON.stringify(contentToLoad));
            setFlashCardsContent(flashContentClone);
            setGeneratedContent(flashContentClone);
            setIsContentLoaded(true);

            // Force update para garantir que o Preview receba os dados
            setTimeout(() => {
              setFlashCardsContent(prev => prev ? {...prev} : flashContentClone);
            }, 50);

          } else {
            console.warn('⚠️ Conteúdo do Flash Cards encontrado mas sem cards válidos');
            contentToLoad = null;
          }
        } catch (error) {
          console.error('❌ Erro ao parsear conteúdo específico do Flash Cards:', error);
          contentToLoad = null;
        }
      } else if (constructedActivities[activity.id]?.generatedContent) {
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

            }
            else if (activity?.id === 'quadro-interativo') {
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
                ...(autoFormData.subject && autoFormData.subject !== 'Português' && { subject: autoFormData.subject }),
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

            }
            else if (activity?.id === 'mapa-mental') {
              console.log('🧠 Processando dados específicos de Mapa Mental');
              enrichedFormData = {
                ...formData,
                title: activityData.title || autoFormData.title || customFields['Título'] || 'Mapa Mental',
                description: activityData.description || autoFormData.description || customFields['Descrição'] || '',
                centralTheme: customFields['Tema Central'] || autoFormData.centralTheme || '',
                mainCategories: customFields['Categorias Principais'] || autoFormData.mainCategories || '',
                generalObjective: customFields['Objetivo Geral'] || autoFormData.generalObjective || '',
                evaluationCriteria: customFields['Critérios de Avaliação'] || autoFormData.evaluationCriteria || '',
              };
              console.log('🧠 Dados do Mapa Mental processados:', enrichedFormData);
            }
            else {
              enrichedFormData = {
                title: consolidatedData.title || autoFormData.title || '',
                description: consolidatedData.description || autoFormData.description || '',
                subject: consolidatedCustomFields['Disciplina'] || consolidatedCustomFields['disciplina'] || autoFormData.subject || 'Português',
                theme: consolidatedCustomFields['Tema'] || consolidatedCustomFields['tema'] || consolidatedCustomFields['Tema das Palavras'] || consolidatedCustomFields['Tema do Vocabulário'] || autoFormData.theme || '',
                schoolYear: consolidatedCustomFields['Ano de Escolaridade'] || consolidatedCustomFields['anoEscolaridade'] || consolidatedCustomFields['ano'] || autoFormData.schoolYear || '',
                numberOfQuestions: consolidatedCustomFields['Quantidade de Questões'] || consolidatedCustomFields['quantidadeQuestoes'] || consolidatedCustomFields['Quantidade de Palavras'] || autoFormData.numberOfQuestions || '10',
                difficultyLevel: consolidatedCustomFields['Nível de Dificuldade'] || consolidatedCustomFields['nivelDificuldade'] || consolidatedCustomFields['dificuldade'] || autoFormData.difficultyLevel || 'Médio',
                questionModel: consolidatedCustomFields['Modelo de Questões'] || consolidatedCustomFields['modeloQuestoes'] || consolidatedCustomFields['Tipo de Avaliação'] || autoFormData.questionModel || '',
                sources: consolidatedCustomFields['Fontes'] || consolidatedCustomFields['fontes'] || consolidatedCustomFields['Referencias'] || autoFormData.sources || '',
                objectives: consolidatedCustomFields['Objetivos'] || consolidatedCustomFields['objetivos'] || consolidatedCustomFields['Competências Trabalhadas'] || autoFormData.objectives || '',
                materials: consolidatedCustomFields['Materiais'] || consolidatedCustomFields['materiais'] || consolidatedCustomFields['Recursos Visuais'] || autoFormData.materials || '',
                instructions: consolidatedCustomFields['Instruções'] || consolidatedCustomFields['instrucoes'] || consolidatedCustomFields['Estratégias de Leitura'] || consolidatedCustomFields['Atividades Práticas'] || autoFormData.instructions || '',
                evaluation: consolidatedCustomFields['Critérios de Correção'] || consolidatedCustomFields['Critérios de Avaliação'] || consolidatedCustomFields['criteriosAvaliacao'] || autoFormData.evaluation || '',
                timeLimit: consolidatedCustomFields['Tempo de Prova'] || consolidatedCustomFields['Tempo Limite'] || consolidatedCustomFields['tempoLimite'] || autoFormData.timeLimit || '',
                context: consolidatedCustomFields['Contexto de Aplicação'] || consolidatedCustomFields['Contexto de Uso'] || consolidatedCustomFields['contexto'] || autoFormData.context || '',
                textType: consolidatedCustomFields['Tipo de Texto'] || consolidatedCustomFields['tipoTexto'] || '',
                textGenre: consolidatedCustomFields['Gênero Textual'] || consolidatedCustomFields['generoTextual'] || '',
                textLength: consolidatedCustomFields['Extensão do Texto'] || consolidatedCustomFields['extensaoTexto'] || '',
                associatedQuestions: consolidatedCustomFields['Questões Associadas'] || consolidatedCustomFields['questoesAssociadas'] || '',
                competencies: consolidatedCustomFields['Competências Trabalhadas'] || consolidatedCustomFields['competencias'] || '',
                readingStrategies: consolidatedCustomFields['Estratégias de Leitura'] || consolidatedCustomFields['estrategiasLeitura'] || '',
                visualResources: consolidatedCustomFields['Recursos Visuais'] || consolidatedCustomFields['recursosVisuais'] || '',
                practicalActivities: consolidatedCustomFields['Atividades Práticas'] || consolidatedCustomFields['atividadesPraticas'] || '',
                wordsIncluded: consolidatedCustomFields['Palavras Incluídas'] || consolidatedCustomFields['palavrasIncluidas'] || '',
                gridFormat: consolidatedCustomFields['Formato da Grade'] || consolidatedCustomFields['formatoGrade'] || '',
                providedHints: consolidatedCustomFields['Dicas Fornecidas'] || consolidatedCustomFields['dicasFornecidas'] || '',
                vocabularyContext: consolidatedCustomFields['Contexto de Uso'] || consolidatedCustomFields['contextoUso'] || '',
                language: consolidatedCustomFields['Idioma'] || consolidatedCustomFields['idioma'] || '',
                associatedExercises: consolidatedCustomFields['Exercícios Associados'] || consolidatedCustomFields['exerciciosAssociados'] || '',
                knowledgeArea: consolidatedCustomFields['Área de Conhecimento'] || consolidatedCustomFields['areaConhecimento'] || '',
                complexityLevel: consolidatedCustomFields['Nível de Complexidade'] || consolidatedCustomFields['nivelComplexidade'] || '',
                tituloTemaAssunto: consolidatedCustomFields['Título do Tema / Assunto'] || autoFormData.tituloTemaAssunto || '',
                anoSerie: consolidatedCustomFields['Ano / Série'] || autoFormData.anoSerie || '',
                disciplina: consolidatedCustomFields['Disciplina'] || autoFormData.disciplina || '',
                bnccCompetencias: consolidatedCustomFields['BNCC / Competências'] || autoFormData.bnccCompetencias || '',
                publicoAlvo: consolidatedCustomFields['Público-alvo'] || autoFormData.publicoAlvo || '',
                objetivosAprendizagem: consolidatedCustomFields['Objetivos de Aprendizagem'] || autoFormData.objetivosAprendizagem || '',
                quantidadeAulas: consolidatedCustomFields['Quantidade de Aulas'] || autoFormData.quantidadeAulas || '',
                quantidadeDiagnosticos: consolidatedCustomFields['Quantidade de Diagnósticos'] || autoFormData.quantidadeDiagnosticos || '',
                quantidadeAvaliacoes: consolidatedCustomFields['Quantidade de Avaliações'] || autoFormData.quantidadeAvaliacoes || '',
                cronograma: consolidatedCustomFields['Cronograma'] || autoFormData.cronograma || '',
                quadroInterativoCampoEspecifico: consolidatedCustomFields['quadroInterativoCampoEspecifico'] || autoFormData.quadroInterativoCampoEspecifico || '',
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
          }
          else if (activity?.id === 'mapa-mental') {
            console.log('🧠 Processando dados diretos de Mapa Mental');
            directFormData = {
              ...formData,
              title: activityData.title || customFields['Título'] || 'Mapa Mental',
              description: activityData.description || customFields['Descrição'] || '',
              centralTheme: customFields['Tema Central'] || '',
              mainCategories: customFields['Categorias Principais'] || '',
              generalObjective: customFields['Objetivo Geral'] || '',
              evaluationCriteria: customFields['Critérios de Avaliação'] || '',
            };
            console.log('🧠 Dados diretos do Mapa Mental processados:', directFormData);
          }
          else if (activity?.id === 'flash-cards') { // Preenchimento direto para Flash Cards
              console.log('🃏 Processando dados diretos de Flash Cards');
              directFormData = {
                ...formData,
                title: activityData.title || customFields['Título'] || 'Flash Cards',
                description: activityData.description || customFields['Descrição'] || '',
                theme: customFields['Tema'] || customFields['tema'] || customFields['Tema dos Flash Cards'] || '',
                topicos: customFields['Tópicos Principais'] || customFields['Tópicos'] || customFields['topicos'] || customFields['tópicos'] || '',
                numberOfFlashcards: customFields['Número de Flash Cards'] || customFields['numeroFlashcards'] || customFields['Quantidade de Flash Cards'] || '10',
                context: customFields['Contexto de Uso'] || customFields['Contexto'] || customFields['contexto'] || '',
              };
              console.log('🃏 Dados diretos do Flash Cards processados:', directFormData);
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

      // Trigger específico para Flash Cards
      if (activityType === 'flash-cards') {
        console.log('🃏 Processamento específico concluído para Flash Cards');

        // Garantir que o conteúdo específico também seja definido
        const flashCardsData = result.data || result;
        setFlashCardsContent(flashCardsData);

        // Salvar na chave específica para Flash Cards
        const flashCardsStorageKey = `constructed_flash-cards_${activity?.id}`;
        localStorage.setItem(flashCardsStorageKey, JSON.stringify({
          success: true,
          data: flashCardsData
        }));

        // Disparar evento customizado para notificar o Preview
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('flash-cards-auto-build', {
            detail: { 
              activityId: activity?.id, 
              data: flashCardsData,
              source: 'EditActivityModal-BuildActivity'
            }
          }));
          console.log('📡 Evento de auto-build disparado para Flash Cards');
        }, 100);

        console.log('💾 Flash Cards processado e salvo:', flashCardsData);
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
    const handleAutoBuild = () => {
      if (activity && formData.title && formData.description && !isGenerating) {
        console.log('🤖 Construção automática iniciada para:', activity.title);
        handleBuildActivity();
      }
    };

    if (activity) {
      (window as any).autoBuildCurrentActivity = handleAutoBuild;
    }

    return () => {
      delete (window as any).autoBuildCurrentActivity;
    };
  }, [activity, formData, isGenerating, handleBuildActivity]);

  const handleSave = async () => {
    if (!activity) return;

    try {
      const customFields = activity.customFields || {};

      const updatedActivity = {
        ...activity,
        ...formData,
        customFields: {
          ...customFields,
          'Disciplina': formData.subject,
          'Tema': formData.theme,
          'Ano de Escolaridade': formData.schoolYear,
          'Tempo Limite': formData.timeLimit,
          'Competências': formData.competencies,
          'Objetivos': formData.objectives,
          'Materiais': formData.materials,
          'Contexto': formData.context,
          'Nível de Dificuldade': formData.difficultyLevel,
          'Critérios de Avaliação': formData.evaluation,
          ...(activity?.id === 'lista-exercicios' && {
            'Quantidade de Questões': formData.numberOfQuestions,
            'Modelo de Questões': formData.questionModel,
            'Fontes': formData.sources,
            'Instruções': formData.instructions
          }),
          ...(activity?.id === 'sequencia-didatica' && {
            'Título do Tema / Assunto': formData.tituloTemaAssunto,
            'Ano / Série': formData.anoSerie,
            'Disciplina': formData.disciplina,
            'BNCC / Competências': formData.bnccCompetencias,
            'Público-alvo': formData.publicoAlvo,
            'Objetivos de Aprendizagem': formData.objetivosAprendizagem,
            'Quantidade de Aulas': formData.quantidadeAulas,
            'Quantidade de Diagnósticos': formData.quantidadeDiagnosticos,
            'Quantidade de Avaliações': formData.quantidadeAvaliacoes,
            'Cronograma': formData.cronograma
          }),
          ...(activity?.id === 'quiz-interativo' && {
            'Número de Questões': formData.numberOfQuestions,
            'Tema': formData.theme,
            'Disciplina': formData.subject,
            'Ano de Escolaridade': formData.schoolYear,
            'Nível de Dificuldade': formData.difficultyLevel,
            'Formato': formData.questionModel,
            'Formato do Quiz': formData.format, // Save new field
            'Tempo por Questão': formData.timePerQuestion, // Save new field
          }),
          ...(activity?.id === 'quadro-interativo' && {
            'quadroInterativoCampoEspecifico': formData.quadroInterativoCampoEspecifico
          }),
          ...(activity?.id === 'mapa-mental' && { // Salvar campos específicos do Mapa Mental
            'Título': formData.title,
            'Descrição': formData.description,
            'Tema Central': formData.centralTheme,
            'Categorias Principais': formData.mainCategories,
            'Objetivo Geral': formData.generalObjective,
            'Critérios de Avaliação': formData.evaluationCriteria,
          }),
          ...(activity?.id === 'flash-cards' && { // Salvar campos específicos do Flash Cards
            'Tema': formData.theme,
            'Tópicos': formData.topicos,
            'Número de Flash Cards': formData.numberOfFlashcards,
            'Contexto': formData.context,
          }),
        }
      };

      if (onUpdateActivity) {
        await onUpdateActivity(updatedActivity);
      }

      localStorage.setItem(`activity_${activity.id}`, JSON.stringify(updatedActivity));
      localStorage.setItem(`activity_fields_${activity.id}`, JSON.stringify(customFields));

      if (activity.categoryId === 'sequencia-didatica' || activity.type === 'sequencia-didatica') {
        const constructedKey = `constructed_sequencia-didatica_${activity.id}`;
        localStorage.setItem(constructedKey, JSON.stringify(updatedActivity));
        console.log('📚 Sequência Didática salva como atividade construída');
      }

      console.log('💾 Dados salvos no localStorage:', {
        activity: updatedActivity,
        fields: customFields
      });

      toast({
        title: "Atividade atualizada",
        description: "As alterações foram salvas com sucesso.",
      });

      onClose();
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
      });
    }
  };

  // Agente Interno de Execução - Automação da Construção de Atividades
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
      (formData.mainCategories && formData.mainCategories !== '') ||
      (formData.generalObjective && formData.generalObjective !== '') ||
      (formData.evaluationCriteria && formData.evaluationCriteria !== '')
    );

    // Verificação específica para Flash Cards
    const isFlashCards = activity.id === 'flash-cards';
    const hasFlashCardsData = isFlashCards && (
      (formData.theme && formData.theme !== '') ||
      (formData.topicos && formData.topicos !== '') ||
      (formData.numberOfFlashcards && formData.numberOfFlashcards !== '10') ||
      (formData.context && formData.context !== '')
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
          mainCategories: formData.mainCategories,
          generalObjective: formData.generalObjective,
          evaluationCriteria: formData.evaluationCriteria,
          hasMapaMentalData
        });
      } else if (isFlashCards) {
        console.log('🃏 Processamento específico para Flash Cards detectado');
        console.log('📊 Estado dos dados do Flash Cards:', {
          theme: formData.theme,
          topicos: formData.topicos,
          numberOfFlashcards: formData.numberOfFlashcards,
          context: formData.context,
          hasFlashCardsData
        });
      }

      console.log('🎯 Acionando construção automática da atividade...');

      const timer = setTimeout(async () => {
        if (isQuizInterativo) {
          console.log('🎯 Auto-build específico para Quiz Interativo');
          await handleGenerateQuizInterativo(); // Use the specific function for Quiz
        } else if (isMapaMental) {
          console.log('🧠 Auto-build específico para Mapa Mental');
          // Para Mapa Mental, a construção é mais um salvamento dos dados inseridos
          // Chama handleBuildActivity que por sua vez chama generateActivityContent
          await handleBuildActivity();
        } else if (isFlashCards) {
          console.log('🃏 Auto-build específico para Flash Cards');
          await handleGenerateFlashCards(); // Use the specific function for Flash Cards
        }
        else {
          console.log('🏗️ Auto-build genérico para outras atividades');
          await handleBuildActivity(); // Use the generic build function
        }
        console.log('✅ Atividade construída automaticamente pelo agente interno');
      }, isQuizInterativo ? 800 : (isQuadroInterativo ? 500 : (isMapaMental ? 300 : (isFlashCards ? 300 : 300)) )); // Increased delay for Quiz for API call

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
                            {(activityType !== 'sequencia-didatica' && activityType !== 'plano-aula' && activityType !== 'quadro-interativo' && activityType !== 'quiz-interativo' && activityType !== 'mapa-mental' && activityType !== 'flash-cards') && (
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
                                  <Label htmlFor="centralTheme" className="text-sm">Tema Central *</Label>
                                  <Input
                                    id="centralTheme"
                                    value={formData.centralTheme}
                                    onChange={(e) => handleInputChange('centralTheme', e.target.value)}
                                    placeholder="Digite o tema central do mapa mental"
                                    required
                                    className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="mainCategories" className="text-sm">Categorias Principais *</Label>
                                  <Textarea
                                    id="mainCategories"
                                    value={formData.mainCategories}
                                    onChange={(e) => handleInputChange('mainCategories', e.target.value)}
                                    placeholder="Liste as principais categorias (separadas por vírgula)"
                                    required
                                    className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="generalObjective" className="text-sm">Objetivo Geral *</Label>
                                  <Textarea
                                    id="generalObjective"
                                    value={formData.generalObjective}
                                    onChange={(e) => handleInputChange('generalObjective', e.target.value)}
                                    placeholder="Qual o objetivo principal do mapa mental?"
                                    required
                                    className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="evaluationCriteria" className="text-sm">Critérios de Avaliação *</Label>
                                  <Textarea
                                    id="evaluationCriteria"
                                    value={formData.evaluationCriteria}
                                    onChange={(e) => handleInputChange('evaluationCriteria', e.target.value)}
                                    placeholder="Como será avaliado o uso do mapa mental?"
                                    required
                                    className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Campos Específicos Flash Cards */}
                            {activityType === 'flash-cards' && (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="theme" className="text-sm">Tema dos Flash Cards *</Label>
                                  <Input
                                    id="theme"
                                    value={formData.theme}
                                    onChange={(e) => handleInputChange('theme', e.target.value)}
                                    placeholder="Ex: Matemática Básica, História do Brasil"
                                    required
                                    className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="topicos" className="text-sm">Tópicos Principais *</Label>
                                  <Textarea
                                    id="topicos"
                                    value={formData.topicos}
                                    onChange={(e) => handleInputChange('topicos', e.target.value)}
                                    placeholder="Liste os tópicos principais (separados por vírgula): adição, subtração, multiplicação"
                                    required
                                    className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="numberOfFlashcards" className="text-sm">Número de Flash Cards *</Label>
                                    <Input
                                      id="numberOfFlashcards"
                                      type="number"
                                      value={formData.numberOfFlashcards}
                                      onChange={(e) => handleInputChange('numberOfFlashcards', e.target.value)}
                                      placeholder="Ex: 10"
                                      min="1"
                                      max="50"
                                      required
                                      className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="context" className="text-sm">Contexto de Uso</Label>
                                    <Input
                                      id="context"
                                      value={formData.context}
                                      onChange={(e) => handleInputChange('context', e.target.value)}
                                      placeholder="Ex: Revisão para prova, estudo em casa"
                                      className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                  </div>
                                </div>
                              </div>
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
                    } else if (activityType === 'flash-cards') {
                      handleGenerateFlashCards();
                    } else {
                      handleBuildActivity();
                    }
                  }}
                  disabled={isBuilding || isGeneratingQuiz || isGeneratingFlashCards || !isFormValidForBuild()}
                  className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBuilding || isGeneratingQuiz || isGeneratingFlashCards ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isGeneratingQuiz ? 'Gerando Quiz...' : 
                       isGeneratingFlashCards ? 'Gerando Flash Cards...' : 
                       (activity?.id === 'quiz-interativo' ? 'Gerando Quiz...' : 
                        activity?.id === 'flash-cards' ? 'Gerando Flash Cards...' : 'Gerando Atividade...')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {activity?.id === 'quiz-interativo' ? 'Gerar Quiz com IA' : 
                       activity?.id === 'flash-cards' ? 'Gerar Flash Cards com IA' : 'Construir Atividade'}
                    </>
                  )}
                </Button>
              </div>
            </div>
            )}

            {activeTab === 'preview' && (
              <div className="h-full">
                <div className="border rounded-lg h-full overflow-hidden bg-white dark:bg-gray-800">
                  {isContentLoaded && (generatedContent || flashCardsContent || quizInterativoContent) ? (
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
                    ) : activity?.id === 'mapa-mental' ? ( // Preview para Mapa Mental
                      <div className="p-6 flex flex-col items-center justify-center h-full text-center">
                        <FileText className="h-16 w-16 text-gray-400 mb-4" />
                        <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          Mapa Mental Gerado
                        </h4>
                        <div className="text-left space-y-2 text-gray-700 dark:text-gray-300">
                          <p><strong>Título:</strong> {generatedContent?.title || formData.title}</p>
                          <p><strong>Descrição:</strong> {generatedContent?.description || formData.description}</p>
                          <p><strong>Tema Central:</strong> {generatedContent?.centralTheme || formData.centralTheme}</p>
                          <p><strong>Categorias Principais:</strong> {generatedContent?.mainCategories.split('\n').map((line: string, i: number) => <span key={i}>{line}<br/></span>)}</p>
                          <p><strong>Objetivo Geral:</strong> {generatedContent?.generalObjective || formData.generalObjective}</p>
                          <p><strong>Critérios de Avaliação:</strong> {generatedContent?.evaluationCriteria || formData.evaluationCriteria}</p>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                          Esta é uma pré-visualização textual. A representação visual do Mapa Mental será gerada em uma ferramenta específica.
                        </p>
                      </div>
                    ) : activity?.id === 'flash-cards' ? ( // Preview para Flash Cards
                      <FlashCardsPreview 
                        content={flashCardsContent || generatedContent || {
                          title: formData.title || 'Flash Cards',
                          description: formData.description || 'Descrição dos flash cards',
                          theme: formData.theme || 'Tema',
                          topicos: formData.topicos || 'Tópicos',
                          numberOfFlashcards: parseInt(formData.numberOfFlashcards) || 0,
                          context: formData.context || 'Contexto',
                          cards: [],
                          totalCards: 0,
                          isGeneratedByAI: false,
                          isFallback: true
                        }}
                        isLoading={isGeneratingFlashCards}
                      />
                    ) : (
                      <ActivityPreview
                        content={generatedContent || formData}
                        activityData={activity}
                      />
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B00] mb-4"></div>
                      <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Aguardando construção...
                      </h4>
                      <p className="text-gray-500 dark:text-gray-500">
                        Configure os campos e clique em "Construir Todas" para gerar o conteúdo.
                      </p>
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
            {(generatedContent || quizInterativoContent || flashCardsContent) && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(flashCardsContent || quizInterativoContent || generatedContent, null, 2));
                    toast({
                      title: "Conteúdo copiado!",
                      description: "O conteúdo da pré-visualização foi copiado para a área de transferência.",
                    });
                  }}
                  className="px-4 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Copy className="h-4 w-4 mr-2" /> Copiar Conteúdo
                </Button>
              </>
            )}
             {(generatedContent || quizInterativoContent || flashCardsContent) && (
              <Button
                variant="outline"
                onClick={() => {
                  clearContent(); // Clear generic content
                  setQuizInterativoContent(null); // Clear specific quiz content
                  setFlashCardsContent(null); // Clear specific flash cards content
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
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Settings, FileText, Play, Download, Edit3, Copy, Save, BookOpen, GamepadIcon, PenTool, Calculator, Beaker, GraduationCap } from 'lucide-react';
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
import { CheckCircle2 } from 'lucide-react';

// --- Componentes de Edição Específicos ---

// Componente genérico para campos comuns
const DefaultEditActivity = ({ formData, onFieldChange }: { formData: ActivityFormData, onFieldChange: (field: keyof ActivityFormData, value: string) => void }) => (
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

// Componente específico para Quadro Interativo
const QuadroInterativoEditActivity = ({ formData, onFieldChange }: { formData: ActivityFormData, onFieldChange: (field: keyof ActivityFormData, value: string) => void }) => (
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
const SequenciaDidaticaEditActivity = ({ formData, onFieldChange }: { formData: ActivityFormData, onFieldChange: (field: keyof Activity FormData, value: string) => void }) => (
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
  });

  // Estado para conteúdo gerado
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);

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
    isGenerating,
  } = useGenerateActivity({
    activityId: activity?.id || '',
    activityType: activity?.id || ''
  });

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
    } else if (activityType === 'quadro-interativo') {
      return formData.title.trim() &&
             formData.description.trim() &&
             formData.subject?.trim() &&
             formData.schoolYear?.trim() &&
             formData.theme?.trim() &&
             formData.objectives?.trim() &&
             formData.difficultyLevel?.trim() &&
             formData.quadroInterativoCampoEspecifico?.trim();
    } else {
      return formData.title.trim() &&
             formData.description.trim() &&
             formData.objectives.trim();
    }
  }, [formData, activity?.id]);

  // Função placeholder para gerar conteúdo
  const generateActivityContent = async (type: string, data: any) => {
    console.log(`Simulando geração de conteúdo para tipo: ${type} com dados:`, data);
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (type === 'plano-aula') {
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

      console.log(`🔎 Estado do localStorage:`, {
        constructedActivities: Object.keys(constructedActivities),
        hasSavedContent: !!savedContent,
        hasPlanoAulaSavedContent: !!planoAulaSavedContent,
        hasSequenciaDidaticaSavedContent: !!sequenciaDidaticaSavedContent,
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

  const loadActivityData = useCallback(async () => {
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

          // Define a processActivityForModal function locally to avoid hoisting issues
          const processActivityForModal = (selectedActivity: ConstructionActivity) => {
            const activityData = selectedActivity.originalData || selectedActivity;
            const currentCustomFields = activityData.customFields || {};

            let processedFormData: ActivityFormData;

            if (selectedActivity?.id === 'plano-aula') {
              processedFormData = {
                title: activityData.personalizedTitle || activityData.title || '',
                description: activityData.personalizedDescription || activityData.description || '',
                subject: currentCustomFields['Componente Curricular'] ||
                         currentCustomFields['disciplina'] ||
                         currentCustomFields['Disciplina'] ||
                         'Matemática',
                theme: currentCustomFields['Tema ou Tópico Central'] ||
                       currentCustomFields['Tema Central'] ||
                       currentCustomFields['tema'] ||
                       currentCustomFields['Tema'] || '',
                schoolYear: currentCustomFields['Ano/Série Escolar'] ||
                           currentCustomFields['Público-Alvo'] ||
                           currentCustomFields['anoEscolaridade'] ||
                           currentCustomFields['Ano de Escolaridade'] || '',
                numberOfQuestions: '1',
                difficultyLevel: currentCustomFields['Tipo de Aula'] ||
                                currentCustomFields['Metodologia'] ||
                                currentCustomFields['tipoAula'] || 'Expositiva',
                questionModel: '',
                sources: currentCustomFields['Fontes'] || currentCustomFields['fontes'] || '',
                objectives: currentCustomFields['Objetivo Geral'] ||
                           currentCustomFields['Objetivos de Aprendizagem'] ||
                           currentCustomFields['Objetivo Principal'] ||
                           currentCustomFields['objetivos'] || '',
                materials: currentCustomFields['Materiais/Recursos'] ||
                          currentCustomFields['Recursos'] ||
                          currentCustomFields['Materiais Necessários'] ||
                          currentCustomFields['materiais'] || '',
                instructions: currentCustomFields['Instruções'] ||
                             currentCustomFields['Metodologia'] ||
                             currentCustomFields['instrucoes'] || '',
                evaluation: currentCustomFields['Observações do Professor'] ||
                           currentCustomFields['Observações'] ||
                           currentCustomFields['Avaliação'] ||
                           currentCustomFields['observacoes'] || '',
                timeLimit: currentCustomFields['Carga Horária'] ||
                          currentCustomFields['Tempo Estimado'] ||
                          currentCustomFields['tempoLimite'] || '',
                context: currentCustomFields['Perfil da Turma'] ||
                        currentCustomFields['Contexto'] ||
                        currentCustomFields['contexto'] || '',
                textType: '',
                textGenre: '',
                textLength: '',
                associatedQuestions: '',
                competencies: currentCustomFields['Habilidades BNCC'] ||
                             currentCustomFields['Competências'] ||
                             currentCustomFields['competencias'] || '',
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
                tituloTemaAssunto: currentCustomFields['Título do Tema / Assunto'] || '',
                anoSerie: currentCustomFields['Ano / Série'] || '',
                disciplina: currentCustomFields['Disciplina'] || '',
                bnccCompetencias: currentCustomFields['BNCC / Competências'] || '',
                publicoAlvo: currentCustomFields['Público-alvo'] || '',
                objetivosAprendizagem: currentCustomFields['Objetivos de Aprendizagem'] || '',
                quantidadeAulas: currentCustomFields['Quantidade de Aulas'] || '',
                quantidadeDiagnosticos: currentCustomFields['Quantidade de Diagnósticos'] || '',
                quantidadeAvaliacoes: currentCustomFields['Quantidade de Avaliações'] || '',
                cronograma: currentCustomFields['Cronograma'] || '',
                quadroInterativoCampoEspecifico: currentCustomFields['quadroInterativoCampoEspecifico'] || '',
              };
            } else if (selectedActivity?.id === 'sequencia-didatica') {
              processedFormData = {
                ...formData,
                title: activityData.title || '',
                description: activityData.description || '',
                tituloTemaAssunto: currentCustomFields['Título do Tema / Assunto'] || '',
                anoSerie: currentCustomFields['Ano / Série'] || '',
                disciplina: currentCustomFields['Disciplina'] || '',
                bnccCompetencias: currentCustomFields['BNCC / Competências'] || '',
                publicoAlvo: currentCustomFields['Público-alvo'] || '',
                objetivosAprendizagem: currentCustomFields['Objetivos de Aprendizagem'] || '',
                quantidadeAulas: currentCustomFields['Quantidade de Aulas'] || '',
                quantidadeDiagnosticos: currentCustomFields['Quantidade de Diagnósticos'] || '',
                quantidadeAvaliacoes: currentCustomFields['Quantidade de Avaliações'] || '',
                cronograma: currentCustomFields['Cronograma'] || '',
                subject: currentCustomFields['Disciplina'] || 'Português',
                theme: currentCustomFields['Tema'] || '',
                schoolYear: currentCustomFields['Ano de Escolaridade'] || '',
                competencies: currentCustomFields['Competências'] || '',
                objectives: currentCustomFields['Objetivos'] || '',
                materials: currentCustomFields['Materiais'] || '',
                context: currentCustomFields['Contexto de Aplicação'] || '',
                evaluation: currentCustomFields['Critérios de Avaliação'] || '',
                quadroInterativoCampoEspecifico: currentCustomFields['quadroInterativoCampoEspecifico'] || '',
              };
            } else if (selectedActivity?.id === 'quadro-interativo') {
              processedFormData = {
                ...formData,
                title: activityData.title || '',
                description: activityData.description || '',
                quadroInterativoCampoEspecifico: currentCustomFields['quadroInterativoCampoEspecifico'] || '',
                subject: currentCustomFields['Disciplina'] || 'Matemática',
                theme: currentCustomFields['Tema'] || '',
                schoolYear: currentCustomFields['Ano de Escolaridade'] || '',
                objectives: currentCustomFields['Objetivos'] || '',
              };
            } else {
              processedFormData = {
                title: activityData.title || '',
                description: activityData.description || '',
                subject: currentCustomFields['Disciplina'] || currentCustomFields['disciplina'] || 'Português',
                theme: currentCustomFields['Tema'] || currentCustomFields['tema'] || '',
                schoolYear: currentCustomFields['Ano de Escolaridade'] || currentCustomFields['anoEscolaridade'] || '',
                numberOfQuestions: currentCustomFields['Quantidade de Questões'] || currentCustomFields['quantidadeQuestoes'] || '10',
                difficultyLevel: currentCustomFields['Nível de Dificuldade'] || currentCustomFields['nivelDificuldade'] || 'Médio',
                questionModel: currentCustomFields['Modelo de Questões'] || currentCustomFields['modeloQuestoes'] || '',
                sources: currentCustomFields['Fontes'] || currentCustomFields['fontes'] || '',
                objectives: currentCustomFields['Objetivos'] || currentCustomFields['objetivos'] || '',
                materials: currentCustomFields['Materiais'] || currentCustomFields['materiais'] || '',
                instructions: currentCustomFields['Instruções'] || currentCustomFields['instrucoes'] || '',
                evaluation: currentCustomFields['Critérios de Correção'] || currentCustomFields['Critérios de Avaliação'] || '',
                timeLimit: currentCustomFields['Tempo Limite'] || '',
                context: currentCustomFields['Contexto de Aplicação'] || '',
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
                tituloTemaAssunto: currentCustomFields['Título do Tema / Assunto'] || '',
                anoSerie: currentCustomFields['Ano / Série'] || '',
                disciplina: currentCustomFields['Disciplina'] || '',
                bnccCompetencias: currentCustomFields['BNCC / Competências'] || '',
                publicoAlvo: currentCustomFields['Público-alvo'] || '',
                objetivosAprendizagem: currentCustomFields['Objetivos de Aprendizagem'] || '',
                quantidadeAulas: currentCustomFields['Quantidade de Aulas'] || '',
                quantidadeDiagnosticos: currentCustomFields['Quantidade de Diagnósticos'] || '',
                quantidadeAvaliacoes: currentCustomFields['Quantidade de Avaliações'] || '',
                cronograma: currentCustomFields['Cronograma'] || '',
                quadroInterativoCampoEspecifico: currentCustomFields['quadroInterativoCampoEspecifico'] || '',
              };
            }
            return { formData: processedFormData, customFields };
          };

          if (activity?.id === 'plano-aula') {
            console.log('📚 Processando dados específicos de Plano de Aula');
            enrichedFormData = processActivityForModal(consolidatedData).formData;
            console.log('✅ Dados do Plano de Aula processados:', enrichedFormData);
          } else if (activity?.id === 'sequencia-didatica') {
            console.log('📚 Processando dados específicos de Sequência Didática');
            enrichedFormData = processActivityForModal(consolidatedData).formData;
            console.log('✅ Dados da Sequência Didática processados:', enrichedFormData);
          } else if (activity?.id === 'quadro-interativo') {
            console.log('🖼️ Processando dados específicos de Quadro Interativo');
            enrichedFormData = processActivityForModal(consolidatedData).formData;
            console.log('🖼️ Dados do Quadro Interativo processados:', enrichedFormData);
          } else {
            enrichedFormData = processActivityForModal(consolidatedData).formData;
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

        // Process activity data logic re-used from above
        const processActivityForModal = (selectedActivity: ConstructionActivity) => {
          const activityData = selectedActivity.originalData || selectedActivity;
          const currentCustomFields = activityData.customFields || {};

          let processedFormData: ActivityFormData;

          if (selectedActivity?.id === 'plano-aula') {
            processedFormData = {
              title: activityData.personalizedTitle || activityData.title || '',
              description: activityData.personalizedDescription || activityData.description || '',
              subject: currentCustomFields['Componente Curricular'] ||
                       currentCustomFields['disciplina'] ||
                       currentCustomFields['Disciplina'] ||
                       'Matemática',
              theme: currentCustomFields['Tema ou Tópico Central'] ||
                     currentCustomFields['Tema Central'] ||
                     currentCustomFields['tema'] ||
                     currentCustomFields['Tema'] || '',
              schoolYear: currentCustomFields['Ano/Série Escolar'] ||
                         currentCustomFields['Público-Alvo'] ||
                         currentCustomFields['anoEscolaridade'] ||
                         currentCustomFields['Ano de Escolaridade'] || '',
              numberOfQuestions: '1',
              difficultyLevel: currentCustomFields['Tipo de Aula'] ||
                              currentCustomFields['Metodologia'] ||
                              currentCustomFields['tipoAula'] || 'Expositiva',
              questionModel: '',
              sources: currentCustomFields['Fontes'] || currentCustomFields['fontes'] || '',
              objectives: currentCustomFields['Objetivo Geral'] ||
                         currentCustomFields['Objetivos de Aprendizagem'] ||
                         currentCustomFields['Objetivo Principal'] ||
                         currentCustomFields['objetivos'] || '',
              materials: currentCustomFields['Materiais/Recursos'] ||
                        currentCustomFields['Recursos'] ||
                        currentCustomFields['Materiais Necessários'] ||
                        currentCustomFields['materiais'] || '',
              instructions: currentCustomFields['Instruções'] ||
                           currentCustomFields['Metodologia'] ||
                           currentCustomFields['instrucoes'] || '',
              evaluation: currentCustomFields['Observações do Professor'] ||
                         currentCustomFields['Observações'] ||
                         currentCustomFields['Avaliação'] ||
                         currentCustomFields['observacoes'] || '',
              timeLimit: currentCustomFields['Carga Horária'] ||
                        currentCustomFields['Tempo Estimado'] ||
                        currentCustomFields['tempoLimite'] || '',
              context: currentCustomFields['Perfil da Turma'] ||
                      currentCustomFields['Contexto'] ||
                      currentCustomFields['contexto'] || '',
              textType: '',
              textGenre: '',
              textLength: '',
              associatedQuestions: '',
              competencies: currentCustomFields['Habilidades BNCC'] ||
                           currentCustomFields['Competências'] ||
                           currentCustomFields['competencias'] || '',
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
              tituloTemaAssunto: currentCustomFields['Título do Tema / Assunto'] || '',
              anoSerie: currentCustomFields['Ano / Série'] || '',
              disciplina: currentCustomFields['Disciplina'] || '',
              bnccCompetencias: currentCustomFields['BNCC / Competências'] || '',
              publicoAlvo: currentCustomFields['Público-alvo'] || '',
              objetivosAprendizagem: currentCustomFields['Objetivos de Aprendizagem'] || '',
              quantidadeAulas: currentCustomFields['Quantidade de Aulas'] || '',
              quantidadeDiagnosticos: currentCustomFields['Quantidade de Diagnósticos'] || '',
              quantidadeAvaliacoes: currentCustomFields['Quantidade de Avaliações'] || '',
              cronograma: currentCustomFields['Cronograma'] || '',
              quadroInterativoCampoEspecifico: currentCustomFields['quadroInterativoCampoEspecifico'] || '',
            };
          } else if (selectedActivity?.id === 'sequencia-didatica') {
            processedFormData = {
              ...formData,
              title: activityData.title || '',
              description: activityData.description || '',
              tituloTemaAssunto: currentCustomFields['Título do Tema / Assunto'] || '',
              anoSerie: currentCustomFields['Ano / Série'] || '',
              disciplina: currentCustomFields['Disciplina'] || '',
              bnccCompetencias: currentCustomFields['BNCC / Competências'] || '',
              publicoAlvo: currentCustomFields['Público-alvo'] || '',
              objetivosAprendizagem: currentCustomFields['Objetivos de Aprendizagem'] || '',
              quantidadeAulas: currentCustomFields['Quantidade de Aulas'] || '',
              quantidadeDiagnosticos: currentCustomFields['Quantidade de Diagnósticos'] || '',
              quantidadeAvaliacoes: currentCustomFields['Quantidade de Avaliações'] || '',
              cronograma: currentCustomFields['Cronograma'] || '',
              subject: currentCustomFields['Disciplina'] || 'Português',
              theme: currentCustomFields['Tema'] || '',
              schoolYear: currentCustomFields['Ano de Escolaridade'] || '',
              competencies: currentCustomFields['Competências'] || '',
              objectives: currentCustomFields['Objetivos'] || '',
              materials: currentCustomFields['Materiais'] || '',
              context: currentCustomFields['Contexto de Aplicação'] || '',
              evaluation: currentCustomFields['Critérios de Avaliação'] || '',
              quadroInterativoCampoEspecifico: currentCustomFields['quadroInterativoCampoEspecifico'] || '',
            };
          } else if (selectedActivity?.id === 'quadro-interativo') {
            processedFormData = {
              ...formData,
              title: activityData.title || '',
              description: activityData.description || '',
              quadroInterativoCampoEspecifico: currentCustomFields['quadroInterativoCampoEspecifico'] || '',
              subject: currentCustomFields['Disciplina'] || 'Matemática',
              theme: currentCustomFields['Tema'] || '',
              schoolYear: currentCustomFields['Ano de Escolaridade'] || '',
              objectives: currentCustomFields['Objetivos'] || '',
            };
          } else {
            processedFormData = {
              title: activityData.title || '',
              description: activityData.description || '',
              subject: currentCustomFields['Disciplina'] || currentCustomFields['disciplina'] || 'Português',
              theme: currentCustomFields['Tema'] || currentCustomFields['tema'] || '',
              schoolYear: currentCustomFields['Ano de Escolaridade'] || currentCustomFields['anoEscolaridade'] || '',
              numberOfQuestions: currentCustomFields['Quantidade de Questões'] || currentCustomFields['quantidadeQuestoes'] || '10',
              difficultyLevel: currentCustomFields['Nível de Dificuldade'] || currentCustomFields['nivelDificuldade'] || 'Médio',
              questionModel: currentCustomFields['Modelo de Questões'] || currentCustomFields['modeloQuestoes'] || '',
              sources: currentCustomFields['Fontes'] || currentCustomFields['fontes'] || '',
              objectives: currentCustomFields['Objetivos'] || currentCustomFields['objetivos'] || '',
              materials: currentCustomFields['Materiais'] || currentCustomFields['materiais'] || '',
              instructions: currentCustomFields['Instruções'] || currentCustomFields['instrucoes'] || '',
              evaluation: currentCustomFields['Critérios de Correção'] || currentCustomFields['Critérios de Avaliação'] || '',
              timeLimit: currentCustomFields['Tempo Limite'] || '',
              context: currentCustomFields['Contexto de Aplicação'] || '',
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
              tituloTemaAssunto: currentCustomFields['Título do Tema / Assunto'] || '',
              anoSerie: currentCustomFields['Ano / Série'] || '',
              disciplina: currentCustomFields['Disciplina'] || '',
              bnccCompetencias: currentCustomFields['BNCC / Competências'] || '',
              publicoAlvo: currentCustomFields['Público-alvo'] || '',
              objetivosAprendizagem: currentCustomFields['Objetivos de Aprendizagem'] || '',
              quantidadeAulas: currentCustomFields['Quantidade de Aulas'] || '',
              quantidadeDiagnosticos: currentCustomFields['Quantidade de Diagnósticos'] || '',
              quantidadeAvaliacoes: currentCustomFields['Quantidade de Avaliações'] || '',
              cronograma: currentCustomFields['Cronograma'] || '',
              quadroInterativoCampoEspecifico: currentCustomFields['quadroInterativoCampoEspecifico'] || '',
            };
          }
          return { formData: processedFormData, customFields };
        };

        if (activity?.id === 'plano-aula') {
          console.log('📚 Processando dados diretos de Plano de Aula');
          directFormData = processActivityForModal(activityData).formData;
          console.log('📝 Dados diretos processados para plano-aula:', directFormData);
        } else if (activity?.id === 'sequencia-didatica') {
          console.log('📚 Processando dados diretos de Sequência Didática');
          directFormData = processActivityForModal(activityData).formData;
          console.log('✅ Dados da Sequência Didática processados:', directFormData);
        } else if (activity?.id === 'quadro-interativo') {
          console.log('🖼️ Processando dados diretos de Quadro Interativo');
          directFormData = processActivityForModal(activityData).formData;
          console.log('🖼️ Dados do Quadro Interativo processados:', directFormData);
        } else {
          directFormData = processActivityForModal(activityData).formData;
        }

        setFormData(directFormData);
        console.log('📝 Formulário preenchido com dados diretos:', directFormData);
      }
    }
  }, [activity, isOpen, formData, onUpdateActivity]);

  // Trigger loading data when modal opens
  useEffect(() => {
    loadActivityData();
  }, [loadActivityData]);


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

      const storageKey = `schoolpower_${activityType}_content`;
      localStorage.setItem(storageKey, JSON.stringify(result));

      if (activityType === 'sequencia-didatica') {
        const viewStorageKey = `constructed_sequencia-didatica_${activity.id}`;
        localStorage.setItem(viewStorageKey, JSON.stringify(result));
        console.log('💾 Dados da sequência didática salvos para visualização:', viewStorageKey);
      }

      if (activityType === 'plano-aula') {
        const viewStorageKey = `constructed_plano-aula_${activity.id}`;
        localStorage.setItem(viewStorageKey, JSON.stringify(result));
        console.log('💾 Dados do plano-aula salvos para visualização:', viewStorageKey);
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

  // Função placeholder for processActivityForModal to be defined within the component scope
  const processActivityForModal = useCallback((selectedActivity: ConstructionActivity) => {
    const activityData = selectedActivity.originalData || selectedActivity;
    const currentCustomFields = activityData.customFields || {};

    let processedFormData: ActivityFormData;

    if (selectedActivity?.id === 'plano-aula') {
      processedFormData = {
        title: activityData.personalizedTitle || activityData.title || '',
        description: activityData.personalizedDescription || activityData.description || '',
        subject: currentCustomFields['Componente Curricular'] ||
                 currentCustomFields['disciplina'] ||
                 currentCustomFields['Disciplina'] ||
                 'Matemática',
        theme: currentCustomFields['Tema ou Tópico Central'] ||
               currentCustomFields['Tema Central'] ||
               currentCustomFields['tema'] ||
               currentCustomFields['Tema'] || '',
        schoolYear: currentCustomFields['Ano/Série Escolar'] ||
                   currentCustomFields['Público-Alvo'] ||
                   currentCustomFields['anoEscolaridade'] ||
                   currentCustomFields['Ano de Escolaridade'] || '',
        numberOfQuestions: '1',
        difficultyLevel: currentCustomFields['Tipo de Aula'] ||
                        currentCustomFields['Metodologia'] ||
                        currentCustomFields['tipoAula'] || 'Expositiva',
        questionModel: '',
        sources: currentCustomFields['Fontes'] || currentCustomFields['fontes'] || '',
        objectives: currentCustomFields['Objetivo Geral'] ||
                   currentCustomFields['Objetivos de Aprendizagem'] ||
                   currentCustomFields['Objetivo Principal'] ||
                   currentCustomFields['objetivos'] || '',
        materials: currentCustomFields['Materiais/Recursos'] ||
                  currentCustomFields['Recursos'] ||
                  currentCustomFields['Materiais Necessários'] ||
                  currentCustomFields['materiais'] || '',
        instructions: currentCustomFields['Instruções'] ||
                     currentCustomFields['Metodologia'] ||
                     currentCustomFields['instrucoes'] || '',
        evaluation: currentCustomFields['Observações do Professor'] ||
                   currentCustomFields['Observações'] ||
                   currentCustomFields['Avaliação'] ||
                   currentCustomFields['observacoes'] || '',
        timeLimit: currentCustomFields['Carga Horária'] ||
                  currentCustomFields['Tempo Estimado'] ||
                  currentCustomFields['tempoLimite'] || '',
        context: currentCustomFields['Perfil da Turma'] ||
                currentCustomFields['Contexto'] ||
                currentCustomFields['contexto'] || '',
        textType: '',
        textGenre: '',
        textLength: '',
        associatedQuestions: '',
        competencies: currentCustomFields['Habilidades BNCC'] ||
                     currentCustomFields['Competências'] ||
                     currentCustomFields['competencias'] || '',
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
        tituloTemaAssunto: currentCustomFields['Título do Tema / Assunto'] || '',
        anoSerie: currentCustomFields['Ano / Série'] || '',
        disciplina: currentCustomFields['Disciplina'] || '',
        bnccCompetencias: currentCustomFields['BNCC / Competências'] || '',
        publicoAlvo: currentCustomFields['Público-alvo'] || '',
        objetivosAprendizagem: currentCustomFields['Objetivos de Aprendizagem'] || '',
        quantidadeAulas: currentCustomFields['Quantidade de Aulas'] || '',
        quantidadeDiagnosticos: currentCustomFields['Quantidade de Diagnósticos'] || '',
        quantidadeAvaliacoes: currentCustomFields['Quantidade de Avaliações'] || '',
        cronograma: currentCustomFields['Cronograma'] || '',
        quadroInterativoCampoEspecifico: currentCustomFields['quadroInterativoCampoEspecifico'] || '',
      };
    } else if (selectedActivity?.id === 'sequencia-didatica') {
      processedFormData = {
        ...formData,
        title: activityData.title || '',
        description: activityData.description || '',
        tituloTemaAssunto: currentCustomFields['Título do Tema / Assunto'] || '',
        anoSerie: currentCustomFields['Ano / Série'] || '',
        disciplina: currentCustomFields['Disciplina'] || '',
        bnccCompetencias: currentCustomFields['BNCC / Competências'] || '',
        publicoAlvo: currentCustomFields['Público-alvo'] || '',
        objetivosAprendizagem: currentCustomFields['Objetivos de Aprendizagem'] || '',
        quantidadeAulas: currentCustomFields['Quantidade de Aulas'] || '',
        quantidadeDiagnosticos: currentCustomFields['Quantidade de Diagnósticos'] || '',
        quantidadeAvaliacoes: currentCustomFields['Quantidade de Avaliações'] || '',
        cronograma: currentCustomFields['Cronograma'] || '',
        subject: currentCustomFields['Disciplina'] || 'Português',
        theme: currentCustomFields['Tema'] || '',
        schoolYear: currentCustomFields['Ano de Escolaridade'] || '',
        competencies: currentCustomFields['Competências'] || '',
        objectives: currentCustomFields['Objetivos'] || '',
        materials: currentCustomFields['Materiais'] || '',
        context: currentCustomFields['Contexto de Aplicação'] || '',
        evaluation: currentCustomFields['Critérios de Avaliação'] || '',
        quadroInterativoCampoEspecifico: currentCustomFields['quadroInterativoCampoEspecifico'] || '',
      };
    } else if (selectedActivity?.id === 'quadro-interativo') {
      processedFormData = {
        ...formData,
        title: activityData.title || '',
        description: activityData.description || '',
        quadroInterativoCampoEspecifico: currentCustomFields['quadroInterativoCampoEspecifico'] || '',
        subject: currentCustomFields['Disciplina'] || 'Matemática',
        theme: currentCustomFields['Tema'] || '',
        schoolYear: currentCustomFields['Ano de Escolaridade'] || '',
        objectives: currentCustomFields['Objetivos'] || '',
      };
    } else {
      processedFormData = {
        title: activityData.title || '',
        description: activityData.description || '',
        subject: currentCustomFields['Disciplina'] || currentCustomFields['disciplina'] || 'Português',
        theme: currentCustomFields['Tema'] || currentCustomFields['tema'] || '',
        schoolYear: currentCustomFields['Ano de Escolaridade'] || currentCustomFields['anoEscolaridade'] || '',
        numberOfQuestions: currentCustomFields['Quantidade de Questões'] || currentCustomFields['quantidadeQuestoes'] || '10',
        difficultyLevel: currentCustomFields['Nível de Dificuldade'] || currentCustomFields['nivelDificuldade'] || 'Médio',
        questionModel: currentCustomFields['Modelo de Questões'] || currentCustomFields['modeloQuestoes'] || '',
        sources: currentCustomFields['Fontes'] || currentCustomFields['fontes'] || '',
        objectives: currentCustomFields['Objetivos'] || currentCustomFields['objetivos'] || '',
        materials: currentCustomFields['Materiais'] || currentCustomFields['materiais'] || '',
        instructions: currentCustomFields['Instruções'] || currentCustomFields['instrucoes'] || '',
        evaluation: currentCustomFields['Critérios de Correção'] || currentCustomFields['Critérios de Avaliação'] || '',
        timeLimit: currentCustomFields['Tempo Limite'] || '',
        context: currentCustomFields['Contexto de Aplicação'] || '',
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
        tituloTemaAssunto: currentCustomFields['Título do Tema / Assunto'] || '',
        anoSerie: currentCustomFields['Ano / Série'] || '',
        disciplina: currentCustomFields['Disciplina'] || '',
        bnccCompetencias: currentCustomFields['BNCC / Competências'] || '',
        publicoAlvo: currentCustomFields['Público-alvo'] || '',
        objetivosAprendizagem: currentCustomFields['Objetivos de Aprendizagem'] || '',
        quantidadeAulas: currentCustomFields['Quantidade de Aulas'] || '',
        quantidadeDiagnosticos: currentCustomFields['Quantidade de Diagnósticos'] || '',
        quantidadeAvaliacoes: currentCustomFields['Quantidade de Avaliações'] || '',
        cronograma: currentCustomFields['Cronograma'] || '',
        quadroInterativoCampoEspecifico: currentCustomFields['quadroInterativoCampoEspecifico'] || '',
      };
    }
    return { formData: processedFormData, customFields: currentCustomFields };
  }, [formData]); // Include formData in dependencies

  // Agente Interno de Execução - Automação da Construção de Atividades
  useEffect(() => {
    if (!activity || !isOpen) return;

    const customFields = activity.customFields || {};

    const preenchidoPorIA = activity.preenchidoAutomaticamente === true ||
                           Object.keys(customFields).length > 0;

    const isFormValid = isFormValidForBuild();

    if (isFormValid && preenchidoPorIA && !activity.isBuilt) {
      console.log('🤖 Agente Interno de Execução: Detectados campos preenchidos pela IA e formulário válido');
      console.log('🎯 Acionando construção automática da atividade...');

      const timer = setTimeout(() => {
        handleBuildActivity();
        console.log('✅ Atividade construída automaticamente pelo agente interno');
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [formData, activity, isOpen, handleBuildActivity, isFormValidForBuild]);


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
          ...(activity?.id === 'quadro-interativo' && {
            'quadroInterativoCampoEspecifico': formData.quadroInterativoCampoEspecifico
          })
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

  const handleCopyContent = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedContent, null, 2));
    toast({
      title: "Conteúdo copiado!",
      description: "O conteúdo da pré-visualização foi copiado para a área de transferência.",
    });
  };

  const getActivityPreviewData = () => {
    return {
      title: formData.title,
      description: formData.description,
      difficulty: formData.difficultyLevel,
      timeLimit: '45 minutos',
      instructions: formData.instructions,
      materials: formData.materials ? formData.materials.split('\n').filter(m => m.trim()) : [],
      objective: formData.objectives,
      targetAudience: formData.schoolYear,
      rubric: formData.evaluation,
      questions: []
    };
  };


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
                            {(activityType !== 'sequencia-didatica' && activityType !== 'plano-aula' && activityType !== 'quadro-interativo') && (
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
                  onClick={handleBuildActivity}
                  disabled={isBuilding || !isFormValidForBuild()}
                  className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBuilding ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {buildingStatus.currentStep || 'Gerando Atividade...'}
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Construir Atividade
                    </>
                  )}
                </Button>
              </div>
            </div>
            )}

            {activeTab === 'preview' && (
              <div className="h-full">
                <div className="border rounded-lg h-full overflow-hidden bg-white dark:bg-gray-800">
                  {isContentLoaded && generatedContent ? (
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
                      <ActivityPreview
                        content={generatedContent || formData}
                        activityData={activity}
                      />
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
            disabled={isGenerating}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4 mr-2" />
            Fechar
          </Button>
            {generatedContent && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCopyContent}
                  className="px-4 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Copy className="h-4 w-4 mr-2" /> Copiar Conteúdo
                </Button>
              </>
            )}
             {generatedContent && (
              <Button
                variant="outline"
                onClick={clearContent}
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
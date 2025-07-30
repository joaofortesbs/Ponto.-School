import React, { useState, useEffect } from 'react';
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
import { ConstructionActivity } from './types';
import { ActivityFormData } from './types/ActivityTypes';
import { useGenerateActivity } from './hooks/useGenerateActivity';
import ActivityPreview from '@/features/schoolpower/activities/default/ActivityPreview';
import ExerciseListPreview from '@/features/schoolpower/activities/lista-exercicios/ExerciseListPreview';

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
  return GraduationCap; // ícone padrão
};

export const EditActivityModal: React.FC<EditActivityModalProps> = ({
  isOpen,
  activity,
  onClose,
  onSave,
  onUpdateActivity
}) => {
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
    complexityLevel: ''
  });

  // Atualizar dados quando a atividade mudar
  useEffect(() => {
    if (activity && isOpen) {
      console.log('🔄 Atualizando dados do modal com atividade:', activity);

      setFormData({
        title: activity.title || activity.personalizedTitle || '',
        description: activity.description || activity.personalizedDescription || '',
        subject: activity.customFields?.disciplina || '',
        theme: activity.customFields?.tema || activity.personalizedTitle || activity.title || '',
        schoolYear: activity.customFields?.anoEscolaridade || '',
        numberOfQuestions: activity.customFields?.nivelDificuldade?.toLowerCase() || 'medium',
        difficultyLevel: activity.customFields?.tempoLimite || '',
        questionModel: '',
        sources: '',
        objectives: activity.description || activity.personalizedDescription || '',
        materials: activity.customFields?.fontes || '',
        instructions: activity.customFields?.contextoAplicacao || '',
        evaluation: activity.customFields?.modeloQuestoes || '',
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
        complexityLevel: ''
      });
    }
  }, [activity, isOpen]);

  const [activeTab, setActiveTab] = useState<'editar' | 'preview'>('editar');

  // Hook para geração de atividades
  const {
    generateActivity,
    loadSavedContent,
    clearContent,
    isGenerating,
    generatedContent,
    error
  } = useGenerateActivity({
    activityId: activity?.id || '',
    activityType: activity?.id || ''
  });

  useEffect(() => {
    if (activity && isOpen) {
      console.log('🔄 Modal aberto, carregando dados para atividade:', activity.id);
      console.log('📊 Dados completos da atividade recebida:', activity);

      // Verificar se há dados automáticos preenchidos
      const autoDataKey = `auto_activity_data_${activity.id}`;
      const autoData = localStorage.getItem(autoDataKey);

      if (autoData) {
        try {
          const { 
            formData: autoFormData, 
            customFields, 
            originalActivity, 
            actionPlanActivity 
          } = JSON.parse(autoData);

          console.log('📋 Carregando dados automáticos para:', activity.title);
          console.log('🔧 Campos personalizados encontrados:', customFields);
          console.log('📊 Dados originais:', originalActivity);
          console.log('📊 Action plan activity:', actionPlanActivity);

          // Garantir que todos os dados disponíveis sejam utilizados
          const consolidatedData = {
            ...activity,
            ...originalActivity,
            ...actionPlanActivity
          };

          const consolidatedCustomFields = {
            ...originalActivity?.customFields,
            ...actionPlanActivity?.customFields,
            ...customFields
          };

          console.log('🔀 Dados consolidados:', consolidatedData);
          console.log('🗂️ Custom fields consolidados:', consolidatedCustomFields);

          // Mapear todos os campos personalizados para os campos do formulário com prioridade correta
          const enrichedFormData = {
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
            // Campos adicionais específicos
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
            complexityLevel: consolidatedCustomFields['Nível de Complexidade'] || consolidatedCustomFields['nivelComplexidade'] || ''
          };

          console.log('✅ Formulário será preenchido com:', enrichedFormData);
          setFormData(enrichedFormData);

          // Aguardar um momento antes de limpar para garantir que o estado foi atualizado
          setTimeout(() => {
            localStorage.removeItem(autoDataKey);
            console.log('🗑️ Dados automáticos limpos do localStorage');
          }, 1000);

        } catch (error) {
          console.error('❌ Erro ao carregar dados automáticos:', error);
          console.error('📊 Dados que causaram erro:', autoData);

          // Usar dados da atividade mesmo com erro
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
            complexityLevel: ''
          };

          setFormData(fallbackData);
          console.log('🔧 Usando dados de fallback:', fallbackData);
        }
      } else {
        console.log('⚠️ Nenhum dado automático encontrado, usando dados da atividade');

        // Carregar dados diretamente da atividade
        const activityData = activity.originalData || activity;
        const customFields = activityData.customFields || {};

        console.log('📊 Dados da atividade para preenchimento:', activityData);
        console.log('🗂️ Custom fields disponíveis:', customFields);

        const directFormData = {
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
          complexityLevel: ''
        };

        setFormData(directFormData);
        console.log('📝 Formulário preenchido com dados diretos:', directFormData);
      }

      // Tentar carregar conteúdo salvo
      if (loadSavedContent) {
        loadSavedContent();
      }
    }
  }, [activity, isOpen, loadSavedContent]);

  const handleInputChange = (field: keyof ActivityFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBuildActivity = async () => {
    await generateActivity(formData);
    // Automaticamente mudar para a aba de pré-visualização após gerar
    setActiveTab('preview');
  };

  const handleSaveChanges = () => {
    const activityData = {
      ...formData,
      generatedContent
    };
    onSave(activityData);
    onClose();
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  const handleExportPDF = () => {
    // Lógica para exportar PDF será implementada futuramente
    console.log('Exportar PDF em desenvolvimento');
  };

  // Verificar se campos obrigatórios estão preenchidos
  const isFormValid = activity?.id === 'lista-exercicios' 
    ? formData.title.trim() && 
      formData.description.trim() && 
      formData.subject.trim() && 
      formData.theme.trim() && 
      formData.schoolYear.trim() &&
      formData.numberOfQuestions.trim() &&
      formData.difficultyLevel.trim() &&
      formData.questionModel.trim()
    : formData.title.trim() && 
      formData.description.trim();

  // Converter formData em formato para ActivityPreview
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

  const handleSave = async () => {
    if (!activity) return;

    try {
      setIsSaving(true);

      // Salvar os dados editados
      const updatedActivity = {
        ...activity,
        ...formData,
        customFields: customFields
      };

      // Chamar a função de atualização passada como prop
      if (onUpdateActivity) {
        await onUpdateActivity(updatedActivity);
      }

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
    } finally {
      setIsSaving(false);
    }
  };

  // Função para acionar automaticamente o botão "Construir Atividade"
  const triggerAutoBuild = async () => {
    if (!activity) return;

    try {
      // Simular clique no botão "Construir Atividade"
      const updatedActivity = {
        ...activity,
        ...formData,
        customFields: customFields,
        isBuilt: true,
        builtAt: new Date().toISOString()
      };

      // Atualizar a atividade com os dados preenchidos pela IA
      if (onUpdateActivity) {
        await onUpdateActivity(updatedActivity);
      }

      console.log('🤖 Atividade construída automaticamente:', updatedActivity);

      // Fechar o modal após a construção automática
      onClose();
    } catch (error) {
      console.error('Erro na construção automática:', error);
    }
  };

  // Effect para detectar quando todos os campos foram preenchidos pela IA
  useEffect(() => {
    if (!activity || !isOpen) return;

    // Verificar se os campos foram preenchidos automaticamente pela IA
    const hasAutoFilledFields = Object.keys(customFields).length > 0 && 
                               formData.title && 
                               formData.description;

    if (hasAutoFilledFields && !activity.isBuilt) {
      // Aguardar um pequeno delay para garantir que todos os campos foram preenchidos
      const timer = setTimeout(() => {
        console.log('🚀 Acionando construção automática da atividade...');
        triggerAutoBuild();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [customFields, formData, activity, isOpen, onUpdateActivity]);

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

              {/* Mini-seções integradas no cabeçalho */}
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

          {/* Mini-sections Tabs */}
          {/* <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
              <TabsList className="h-12 w-full justify-start rounded-none bg-transparent border-0 p-0">
                <TabsTrigger 
                  value="editar" 
                  className="flex items-center space-x-2 h-12 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF6B00] data-[state=active]:bg-white data-[state=active]:dark:bg-gray-900 data-[state=active]:text-[#FF6B00] bg-transparent"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Editar</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="preview" 
                  className="flex items-center space-x-2 h-12 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF6B00] data-[state=active]:bg-white data-[state=active]:dark:bg-gray-900 data-[state=active]:text-[#FF6B00] bg-transparent"
                >
                  <FileText className="h-4 w-4" />
                  <span>Pré-visualização</span>
                  {generatedContent && (
                    <Badge className="ml-1 bg-green-500 text-white text-xs">Pronto</Badge>
                  )}
                </TabsTrigger>
              </TabsList> */}

              {/* Content */}
              <div className="p-6 h-[calc(800px-180px)] overflow-hidden">
                {activeTab === 'editar' && (
                <div className="flex gap-6 h-full">
                  {/* Formulário (100%) */}
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

                          {/* Campos específicos para Lista de Exercícios */}
                          {activity?.id === 'lista-exercicios' && (
                            <>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="subject" className="text-sm">Disciplina</Label>
                                  <Input
                                    id="subject"
                                    value={formData.subject}
                                    onChange={(e) => handleInputChange('subject', e.target.value)}
                                    placeholder="Ex: Português, Matemática, História..."
                                    className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="theme" className="text-sm">Tema</Label>
                                  <Input
                                    id="theme"
                                    value={formData.theme}
                                    onChange={(e) => handleInputChange('theme', e.target.value)}
                                    placeholder="Ex: Substantivos e Verbos"
                                    className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="schoolYear" className="text-sm">Ano de Escolaridade</Label>
                                  <Input
                                    id="schoolYear"
                                    value={formData.schoolYear}
                                    onChange={(e) => handleInputChange('schoolYear', e.target.value)}
                                    placeholder="Ex: 6º ano, 7º ano, 1º ano EM..."
                                    className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="numberOfQuestions" className="text-sm">Número de Questões</Label>
                                  <Input
                                    id="numberOfQuestions"
                                    value={formData.numberOfQuestions}
                                    onChange={(e) => handleInputChange('numberOfQuestions', e.target.value)}
                                    placeholder="Ex: 5, 10, 15, 20..."
                                    className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="difficultyLevel" className="text-sm">Nível de Dificuldade</Label>
                                  <Input
                                    id="difficultyLevel"
                                    value={formData.difficultyLevel}
                                    onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
                                    placeholder="Ex: Básico, Intermediário, Avançado..."
                                    className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="questionModel" className="text-sm">Modelo de Questões</Label>
                                  <Input
                                    id="questionModel"
                                    value={formData.questionModel}
                                    onChange={(e) => handleInputChange('questionModel', e.target.value)}
                                    placeholder="Ex: Múltipla Escolha, Dissertativa, Mista..."
                                    className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="sources" className="text-sm">Fontes</Label>
                                <Textarea
                                  id="sources"
                                  value={formData.sources}
                                  onChange={(e) => handleInputChange('sources', e.target.value)}
                                  placeholder="Digite as fontes de referência..."
                                  className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                />
                              </div>

                              {/* Campos adicionais específicos baseados nos customFields */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="timeLimit" className="text-sm">Tempo Limite</Label>
                                  <Input
                                    id="timeLimit"
                                    value={formData.timeLimit || ''}
                                    onChange={(e) => handleInputChange('timeLimit', e.target.value)}
                                    placeholder="Ex: 50 minutos, 1 hora..."
                                    className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="context" className="text-sm">Contexto de Aplicação</Label>
                                  <Input
                                    id="context"
                                    value={formData.context || ''}
                                    onChange={(e) => handleInputChange('context', e.target.value)}
                                    placeholder="Ex: Produção textual, Sala de aula..."
                                    className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {/* Campos genéricos para outras atividades */}
                          {activity?.id !== 'lista-exercicios' && (
                            <>
                              <div>
                                <Label htmlFor="objectives" className="text-sm">Objetivos de Aprendizagem</Label>
                                <Textarea
                                  id="objectives"
                                  value={formData.objectives}
                                  onChange={(e) => handleInputChange('objectives', e.target.value)}
                                  placeholder="Descreva os objetivos que os alunos devem alcançar..."
                                  className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                />
                              </div>

                              <div>
                                <Label htmlFor="materials" className="text-sm">Materiais Necessários</Label>
                                <Textarea
                                  id="materials"
                                  value={formData.materials}
                                  onChange={(e) => handleInputChange('materials', e.target.value)}
                                  placeholder="Liste os materiais necessários (um por linha)..."
                                  className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                />
                              </div>

                              <div>
                                <Label htmlFor="instructions" className="text-sm">Instruções da Atividade</Label>
                                <Textarea
                                  id="instructions"
                                  value={formData.instructions}
                                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                                  placeholder="Descreva como a atividade deve ser executada..."
                                  className="mt-1 min-h-[80px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                />
                              </div>

                              <div>
                                <Label htmlFor="evaluation" className="text-sm">Critérios de Avaliação</Label>
                                <Textarea
                                  id="evaluation"
                                  value={formData.evaluation}
                                  onChange={(e) => handleInputChange('evaluation', e.target.value)}
                                  placeholder="Como a atividade será avaliada..."
                                  className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                      </div>
                    )}

                    <Button
                      onClick={handleBuildActivity}
                      disabled={isGenerating || !isFormValid}
                      className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Gerando Atividade...
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
                      {generatedContent ? (
                        activity?.id === 'lista-exercicios' ? (
                          <ExerciseListPreview exerciseData={JSON.parse(generatedContent)} />
                        ) : (
                          <div className="p-6 h-full overflow-y-auto">
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <pre className="whitespace-pre-wrap font-sans text-gray-900 dark:text-white leading-relaxed">
                                {generatedContent}
                              </pre>
                            </div>
                          </div>
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
            {/* </Tabs> */}
          {/* </div> */}

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {generatedContent && (
                  <Button
                    variant="outline"
                    onClick={clearContent}
                    className="px-4 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Limpar Conteúdo
                  </Button>
                )}
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-6 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  className="px-6 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-semibold"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditActivityModal;
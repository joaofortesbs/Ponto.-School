
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Eye, Settings, FileText, Play, Download, Save, 
  Loader2, CheckCircle, AlertCircle, Sparkles, Palette,
  Moon, Sun, Zap, Target, Clock, BookOpen, PenTool,
  Users, Award, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTheme } from '@/hooks/useTheme';
import { ConstructionActivity } from './types';

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ConstructionActivity | null;
  onSave: (activityData: any) => void;
}

interface ActivityFormData {
  title: string;
  description: string;
  subject: string;
  difficulty: string;
  format: string;
  duration: string;
  objectives: string;
  materials: string;
  instructions: string;
  evaluation: string;
  tags: string[];
  targetAudience: string;
  prerequisites: string;
}

const SUBJECTS = [
  'Português', 'Matemática', 'História', 'Geografia', 'Ciências',
  'Física', 'Química', 'Biologia', 'Inglês', 'Filosofia', 'Sociologia',
  'Artes', 'Educação Física', 'Literatura'
];

const DIFFICULTIES = [
  { value: 'Iniciante', label: 'Iniciante', color: 'bg-green-500' },
  { value: 'Básico', label: 'Básico', color: 'bg-blue-500' },
  { value: 'Intermediário', label: 'Intermediário', color: 'bg-yellow-500' },
  { value: 'Avançado', label: 'Avançado', color: 'bg-orange-500' },
  { value: 'Expert', label: 'Expert', color: 'bg-red-500' }
];

const FORMATS = [
  { value: 'PDF', label: 'PDF Imprimível', icon: FileText },
  { value: 'Interativo', label: 'Atividade Interativa', icon: Zap },
  { value: 'Vídeo', label: 'Vídeo Explicativo', icon: Play },
  { value: 'Apresentação', label: 'Apresentação Slides', icon: BookOpen },
  { value: 'Jogo', label: 'Jogo Educativo', icon: Target }
];

const DURATIONS = [
  '15 minutos', '30 minutos', '45 minutos', '1 hora', 
  '1h 30min', '2 horas', '3 horas', 'Mais de 3 horas'
];

export const EditActivityModal: React.FC<EditActivityModalProps> = ({
  isOpen,
  onClose,
  activity,
  onSave
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('info');
  
  const [formData, setFormData] = useState<ActivityFormData>({
    title: '',
    description: '',
    subject: 'Português',
    difficulty: 'Intermediário',
    format: 'PDF',
    duration: '30 minutos',
    objectives: '',
    materials: '',
    instructions: '',
    evaluation: '',
    tags: [],
    targetAudience: '',
    prerequisites: ''
  });

  const [generatedActivity, setGeneratedActivity] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState<'preview' | 'code'>('preview');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Memoized theme classes
  const themeClasses = useMemo(() => ({
    modal: theme === 'dark' 
      ? 'bg-gray-900 border-gray-700' 
      : 'bg-white border-gray-200',
    card: theme === 'dark' 
      ? 'bg-gray-800 border-gray-700' 
      : 'bg-gray-50 border-gray-200',
    input: theme === 'dark' 
      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    preview: theme === 'dark' 
      ? 'bg-gray-800 border-gray-700' 
      : 'bg-gray-50 border-gray-200',
    header: theme === 'dark'
      ? 'from-gray-800 to-gray-900 border-gray-700'
      : 'from-[#FF6B00] to-[#FF8C40] border-orange-200'
  }), [theme]);

  // Enhanced form validation
  const validateForm = useCallback(() => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) errors.push('Título é obrigatório');
    if (!formData.description.trim()) errors.push('Descrição é obrigatória');
    if (!formData.objectives.trim()) errors.push('Objetivos são obrigatórios');
    if (formData.title.length > 100) errors.push('Título muito longo (máx. 100 caracteres)');
    if (formData.description.length > 500) errors.push('Descrição muito longa (máx. 500 caracteres)');
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [formData]);

  // Initialize form data
  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title || '',
        description: activity.description || '',
        subject: 'Português',
        difficulty: 'Intermediário',
        format: 'PDF',
        duration: '30 minutos',
        objectives: '',
        materials: '',
        instructions: '',
        evaluation: '',
        tags: [],
        targetAudience: '',
        prerequisites: ''
      });
    }
  }, [activity]);

  // Handle input changes with validation
  const handleInputChange = useCallback((field: keyof ActivityFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  }, [validationErrors.length]);

  // Enhanced activity generation
  const handleBuildActivity = useCallback(async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { generateActivity, validateFormData } = await import('./activityGeneratorService');

      // Validate form data
      const errors = validateFormData(formData);
      if (errors.length > 0) {
        setValidationErrors(errors);
        setIsGenerating(false);
        clearInterval(progressInterval);
        return;
      }

      // Generate activity
      const result = await generateActivity(formData);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      setTimeout(() => {
        setGeneratedActivity(result.content);
        setIsGenerating(false);
        setActiveTab('preview');
      }, 500);
      
    } catch (error) {
      console.error('Erro ao gerar atividade:', error);
      setValidationErrors(['Erro ao gerar atividade. Tente novamente.']);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [formData, validateForm]);

  // Save changes with validation
  const handleSaveChanges = useCallback(() => {
    if (!validateForm()) return;

    const activityData = {
      ...formData,
      generatedContent: generatedActivity,
      lastModified: new Date().toISOString()
    };
    
    onSave(activityData);
    setIsDirty(false);
    onClose();
  }, [formData, generatedActivity, onSave, onClose, validateForm]);

  // Handle modal close with unsaved changes warning
  const handleClose = useCallback(() => {
    if (isDirty) {
      const confirmClose = window.confirm('Você tem alterações não salvas. Deseja realmente fechar?');
      if (!confirmClose) return;
    }
    onClose();
  }, [isDirty, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          handleSaveChanges();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleBuildActivity();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, handleSaveChanges, handleBuildActivity]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`w-full max-w-7xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden ${themeClasses.modal}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Header */}
          <div className={`flex items-center justify-between p-6 border-b bg-gradient-to-r ${themeClasses.header}`}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Editar Materiais - {activity?.title}
                </h2>
                <p className="text-white/80 text-sm">
                  Configure e personalize sua atividade educacional
                </p>
              </div>
              {isDirty && (
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Não Salvo
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveTab(activeTab === 'info' ? 'preview' : 'info')}
                className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white"
                title="Alternar visualização"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 border-b border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <Alert className="border-red-300 dark:border-red-700">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Generation Progress */}
          {isGenerating && (
            <div className="p-4 border-b border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-blue-700 dark:text-blue-300 mb-1">
                    <span>Gerando atividade...</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <TabsList className="h-14 w-full justify-start rounded-none bg-transparent">
                <TabsTrigger 
                  value="info" 
                  className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
                >
                  <FileText className="h-4 w-4" />
                  Informações
                </TabsTrigger>
                <TabsTrigger 
                  value="content" 
                  className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
                >
                  <PenTool className="h-4 w-4" />
                  Conteúdo
                </TabsTrigger>
                <TabsTrigger 
                  value="preview" 
                  className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
                >
                  <Eye className="h-4 w-4" />
                  Pré-visualização
                  {generatedActivity && <Badge variant="secondary" className="ml-1 h-5 text-xs">Pronto</Badge>}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 p-6 overflow-hidden">
              <TabsContent value="info" className="h-full m-0">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <Card className={`${themeClasses.card} border`}>
                      <CardContent className="p-6">
                        <h3 className={`font-semibold text-lg mb-4 flex items-center ${themeClasses.text}`}>
                          <Target className="h-5 w-5 mr-2 text-[#FF6B00]" />
                          Informações Básicas
                        </h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="title" className={`text-sm font-medium ${themeClasses.text}`}>
                                Título da Atividade *
                              </Label>
                              <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="Digite um título atrativo e descritivo"
                                className={`mt-1 ${themeClasses.input}`}
                                maxLength={100}
                              />
                              <p className={`text-xs mt-1 ${themeClasses.textSecondary}`}>
                                {formData.title.length}/100 caracteres
                              </p>
                            </div>

                            <div>
                              <Label htmlFor="description" className={`text-sm font-medium ${themeClasses.text}`}>
                                Descrição *
                              </Label>
                              <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Descreva brevemente o que a atividade aborda..."
                                className={`mt-1 min-h-[100px] ${themeClasses.input}`}
                                maxLength={500}
                              />
                              <p className={`text-xs mt-1 ${themeClasses.textSecondary}`}>
                                {formData.description.length}/500 caracteres
                              </p>
                            </div>

                            <div>
                              <Label htmlFor="targetAudience" className={`text-sm font-medium ${themeClasses.text}`}>
                                Público-Alvo
                              </Label>
                              <Input
                                id="targetAudience"
                                value={formData.targetAudience}
                                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                                placeholder="Ex: Ensino Médio, 9º ano, Adultos..."
                                className={`mt-1 ${themeClasses.input}`}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="subject" className={`text-sm font-medium ${themeClasses.text}`}>
                                Disciplina
                              </Label>
                              <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                                <SelectTrigger className={`mt-1 ${themeClasses.input}`}>
                                  <SelectValue placeholder="Selecione a disciplina" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SUBJECTS.map(subject => (
                                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="difficulty" className={`text-sm font-medium ${themeClasses.text}`}>
                                Nível de Dificuldade
                              </Label>
                              <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                                <SelectTrigger className={`mt-1 ${themeClasses.input}`}>
                                  <SelectValue placeholder="Selecione a dificuldade" />
                                </SelectTrigger>
                                <SelectContent>
                                  {DIFFICULTIES.map(diff => (
                                    <SelectItem key={diff.value} value={diff.value}>
                                      <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${diff.color}`} />
                                        {diff.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="format" className={`text-sm font-medium ${themeClasses.text}`}>
                                  Formato
                                </Label>
                                <Select value={formData.format} onValueChange={(value) => handleInputChange('format', value)}>
                                  <SelectTrigger className={`mt-1 ${themeClasses.input}`}>
                                    <SelectValue placeholder="Formato" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {FORMATS.map(format => (
                                      <SelectItem key={format.value} value={format.value}>
                                        <div className="flex items-center gap-2">
                                          <format.icon className="h-4 w-4" />
                                          {format.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor="duration" className={`text-sm font-medium ${themeClasses.text}`}>
                                  Duração
                                </Label>
                                <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                                  <SelectTrigger className={`mt-1 ${themeClasses.input}`}>
                                    <SelectValue placeholder="Duração" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {DURATIONS.map(duration => (
                                      <SelectItem key={duration} value={duration}>
                                        <div className="flex items-center gap-2">
                                          <Clock className="h-4 w-4" />
                                          {duration}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="content" className="h-full m-0">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-6">
                    {/* Learning Content */}
                    <Card className={`${themeClasses.card} border`}>
                      <CardContent className="p-6">
                        <h3 className={`font-semibold text-lg mb-4 flex items-center ${themeClasses.text}`}>
                          <BookOpen className="h-5 w-5 mr-2 text-[#FF6B00]" />
                          Conteúdo Pedagógico
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="objectives" className={`text-sm font-medium ${themeClasses.text}`}>
                              Objetivos de Aprendizagem *
                            </Label>
                            <Textarea
                              id="objectives"
                              value={formData.objectives}
                              onChange={(e) => handleInputChange('objectives', e.target.value)}
                              placeholder="Descreva claramente o que os alunos devem alcançar ao final da atividade..."
                              className={`mt-1 min-h-[80px] ${themeClasses.input}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor="prerequisites" className={`text-sm font-medium ${themeClasses.text}`}>
                              Pré-requisitos
                            </Label>
                            <Textarea
                              id="prerequisites"
                              value={formData.prerequisites}
                              onChange={(e) => handleInputChange('prerequisites', e.target.value)}
                              placeholder="Conhecimentos ou habilidades necessários antes desta atividade..."
                              className={`mt-1 min-h-[60px] ${themeClasses.input}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor="materials" className={`text-sm font-medium ${themeClasses.text}`}>
                              Materiais e Recursos
                            </Label>
                            <Textarea
                              id="materials"
                              value={formData.materials}
                              onChange={(e) => handleInputChange('materials', e.target.value)}
                              placeholder="Liste todos os materiais, ferramentas e recursos necessários..."
                              className={`mt-1 min-h-[80px] ${themeClasses.input}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor="instructions" className={`text-sm font-medium ${themeClasses.text}`}>
                              Instruções da Atividade
                            </Label>
                            <Textarea
                              id="instructions"
                              value={formData.instructions}
                              onChange={(e) => handleInputChange('instructions', e.target.value)}
                              placeholder="Passo a passo detalhado de como realizar a atividade..."
                              className={`mt-1 min-h-[120px] ${themeClasses.input}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor="evaluation" className={`text-sm font-medium ${themeClasses.text}`}>
                              Critérios de Avaliação
                            </Label>
                            <Textarea
                              id="evaluation"
                              value={formData.evaluation}
                              onChange={(e) => handleInputChange('evaluation', e.target.value)}
                              placeholder="Como a atividade será avaliada e quais são os critérios de sucesso..."
                              className={`mt-1 min-h-[80px] ${themeClasses.input}`}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Generate Button */}
                    <div className="flex justify-center">
                      <Button
                        onClick={handleBuildActivity}
                        disabled={isGenerating || !formData.title || !formData.description}
                        className="px-8 py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        size="lg"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Gerando Atividade...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            Construir Atividade
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="preview" className="h-full m-0">
                <div className="h-full flex flex-col">
                  {/* Preview Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-semibold text-lg flex items-center ${themeClasses.text}`}>
                      <Eye className="h-5 w-5 mr-2 text-[#FF6B00]" />
                      Pré-visualização da Atividade
                    </h3>
                    {generatedActivity && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant={previewMode === 'preview' ? 'default' : 'outline'}
                          onClick={() => setPreviewMode('preview')}
                          className="text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Visualização
                        </Button>
                        <Button
                          size="sm"
                          variant={previewMode === 'code' ? 'default' : 'outline'}
                          onClick={() => setPreviewMode('code')}
                          className="text-xs"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Código
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Preview Content */}
                  <Card className={`flex-1 ${themeClasses.preview} border`}>
                    <CardContent className="p-6 h-full">
                      <ScrollArea className="h-full">
                        {generatedActivity ? (
                          <div className="space-y-4">
                            {previewMode === 'preview' ? (
                              <div className={`prose prose-sm max-w-none ${theme === 'dark' ? 'prose-invert' : ''}`}>
                                <div 
                                  dangerouslySetInnerHTML={{ 
                                    __html: generatedActivity.replace(/\n/g, '<br/>') 
                                  }} 
                                />
                              </div>
                            ) : (
                              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-auto">
                                <pre className="whitespace-pre-wrap">{generatedActivity}</pre>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${themeClasses.card}`}>
                              <Lightbulb className={`h-10 w-10 ${themeClasses.textSecondary}`} />
                            </div>
                            <h4 className={`text-lg font-medium mb-2 ${themeClasses.text}`}>
                              Nenhuma atividade gerada ainda
                            </h4>
                            <p className={`text-sm max-w-md ${themeClasses.textSecondary}`}>
                              Preencha as informações básicas e o conteúdo pedagógico, depois clique em "Construir Atividade" para ver a pré-visualização aqui.
                            </p>
                          </div>
                        )}
                      </ScrollArea>

                      {/* Export Options */}
                      {generatedActivity && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Baixar PDF
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Exportar Docx
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Enhanced Footer */}
          <div className={`flex flex-col space-y-3 p-6 border-t ${themeClasses.card.includes('bg-gray-800') ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
            {/* Status Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${activity?.status === 'completed' ? 'border-green-500 text-green-600' : 'border-yellow-500 text-yellow-600'}`}
                >
                  <div className={`w-2 h-2 rounded-full mr-1 ${activity?.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  Status: {activity?.status === 'completed' ? 'Concluída' : 'Em Progresso'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  Progresso: {activity?.progress || 0}%
                </Badge>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Atalhos: Ctrl+S (Salvar) • Ctrl+Enter (Gerar) • Esc (Fechar)
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={!isDirty || validationErrors.length > 0}
                className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Save className="h-4 w-4 mr-2" />
                {isDirty ? 'Salvar Alterações' : 'Tudo Salvo'}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditActivityModal;

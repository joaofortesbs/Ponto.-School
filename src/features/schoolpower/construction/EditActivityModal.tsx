
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Settings, FileText, Play, Download, Edit3, Copy, Save } from 'lucide-react';
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
  onClose: () => void;
  activity: ConstructionActivity | null;
  onSave: (activityData: any) => void;
}

export const EditActivityModal: React.FC<EditActivityModalProps> = ({
  isOpen,
  onClose,
  activity,
  onSave
}) => {
  const [formData, setFormData] = useState<ActivityFormData>({
    title: '',
    description: '',
    subject: '',
    theme: '',
    schoolYear: '',
    numberOfQuestions: '',
    difficultyLevel: 'Médio',
    questionModel: '',
    sources: '',
    objectives: '',
    materials: '',
    instructions: '',
    evaluation: ''
  });

  const [activeTab, setActiveTab] = useState<'editar' | 'visualizar' | 'preview'>('editar');

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
    if (activity) {
      // Carregar dados da atividade
      setFormData({
        title: activity.title || '',
        description: activity.description || '',
        subject: 'Português',
        theme: '',
        schoolYear: '',
        numberOfQuestions: '10',
        difficultyLevel: 'Médio',
        questionModel: '',
        sources: '',
        objectives: '',
        materials: '',
        instructions: '',
        evaluation: ''
      });

      // Tentar carregar conteúdo salvo
      loadSavedContent();
    }
  }, [activity, loadSavedContent]);

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
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Editar Materiais - {activity?.title}
                </h2>
                <p className="text-white/80 text-sm">
                  Configure os materiais e gere o conteúdo da atividade
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Mini-sections Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
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
                  value="visualizar" 
                  className="flex items-center space-x-2 h-12 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF6B00] data-[state=active]:bg-white data-[state=active]:dark:bg-gray-900 data-[state=active]:text-[#FF6B00] bg-transparent"
                >
                  <Eye className="h-4 w-4" />
                  <span>Visualizar</span>
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
              </TabsList>

              {/* Content */}
              <div className="p-6 h-[calc(800px-180px)] overflow-hidden">
                <TabsContent value="editar" className="mt-0 h-full">
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
                                    <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                                      <SelectTrigger className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                                        <SelectValue placeholder="Selecione a disciplina" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                        <SelectItem value="Português">Português</SelectItem>
                                        <SelectItem value="Matemática">Matemática</SelectItem>
                                        <SelectItem value="História">História</SelectItem>
                                        <SelectItem value="Geografia">Geografia</SelectItem>
                                        <SelectItem value="Ciências">Ciências</SelectItem>
                                        <SelectItem value="Física">Física</SelectItem>
                                        <SelectItem value="Química">Química</SelectItem>
                                        <SelectItem value="Biologia">Biologia</SelectItem>
                                      </SelectContent>
                                    </Select>
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
                                    <Select value={formData.schoolYear} onValueChange={(value) => handleInputChange('schoolYear', value)}>
                                      <SelectTrigger className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                                        <SelectValue placeholder="Selecione o ano" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                        <SelectItem value="6º ano">6º ano</SelectItem>
                                        <SelectItem value="7º ano">7º ano</SelectItem>
                                        <SelectItem value="8º ano">8º ano</SelectItem>
                                        <SelectItem value="9º ano">9º ano</SelectItem>
                                        <SelectItem value="1º ano EM">1º ano EM</SelectItem>
                                        <SelectItem value="2º ano EM">2º ano EM</SelectItem>
                                        <SelectItem value="3º ano EM">3º ano EM</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label htmlFor="numberOfQuestions" className="text-sm">Número de Questões</Label>
                                    <Select value={formData.numberOfQuestions} onValueChange={(value) => handleInputChange('numberOfQuestions', value)}>
                                      <SelectTrigger className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                                        <SelectValue placeholder="Selecione a quantidade" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                        <SelectItem value="5">5 questões</SelectItem>
                                        <SelectItem value="10">10 questões</SelectItem>
                                        <SelectItem value="15">15 questões</SelectItem>
                                        <SelectItem value="20">20 questões</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="difficultyLevel" className="text-sm">Nível de Dificuldade</Label>
                                    <Select value={formData.difficultyLevel} onValueChange={(value) => handleInputChange('difficultyLevel', value)}>
                                      <SelectTrigger className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                                        <SelectValue placeholder="Selecione a dificuldade" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                        <SelectItem value="Básico">Básico</SelectItem>
                                        <SelectItem value="Intermediário">Intermediário</SelectItem>
                                        <SelectItem value="Avançado">Avançado</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label htmlFor="questionModel" className="text-sm">Modelo de Questões</Label>
                                    <Select value={formData.questionModel} onValueChange={(value) => handleInputChange('questionModel', value)}>
                                      <SelectTrigger className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                                        <SelectValue placeholder="Selecione o modelo" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                        <SelectItem value="Múltipla Escolha">Múltipla Escolha</SelectItem>
                                        <SelectItem value="Dissertativa">Dissertativa</SelectItem>
                                        <SelectItem value="Verdadeiro/Falso">Verdadeiro/Falso</SelectItem>
                                        <SelectItem value="Mista">Mista</SelectItem>
                                      </SelectContent>
                                    </Select>
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
                </TabsContent>

                <TabsContent value="visualizar" className="mt-0 h-full">
                  <div className="h-full">
                    <Card className="h-full">
                      <CardContent className="p-6 h-full">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-semibold text-xl flex items-center">
                            <Eye className="h-6 w-6 mr-2 text-[#FF6B00]" />
                            Visualização da Atividade
                          </h3>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleExportPDF}
                              className="text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Baixar PDF
                            </Button>
                          </div>
                        </div>

                        <div className="border rounded-lg h-[calc(100%-100px)] overflow-hidden bg-white dark:bg-gray-800">
                          {activity?.id === 'lista-exercicios' && generatedContent ? (
                            <ExerciseListPreview exerciseData={JSON.parse(generatedContent)} />
                          ) : (
                            <div className="p-6 h-full overflow-y-auto">
                              <ActivityPreview activityData={getActivityPreviewData()} />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="mt-0 h-full">
                  <div className="h-full">
                    <Card className="h-full">
                      <CardContent className="p-6 h-full">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-semibold text-xl flex items-center">
                            <FileText className="h-6 w-6 mr-2 text-[#FF6B00]" />
                            Atividade Gerada pela IA
                          </h3>
                          {generatedContent && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCopyContent}
                                className="text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copiar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleExportPDF}
                                className="text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Exportar PDF
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="border rounded-lg h-[calc(100%-100px)] overflow-hidden bg-white dark:bg-gray-800">
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
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Settings, FileText, Play, Download, Edit3 } from 'lucide-react';
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
import ActivityPreview from '@/features/schoolpower/activities/default/ActivityPreview';

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
    difficulty: 'Médio',
    format: 'PDF',
    duration: '30 minutos',
    objectives: '',
    materials: '',
    instructions: '',
    evaluation: ''
  });

  const [generatedActivity, setGeneratedActivity] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'editar' | 'visualizar'>('editar');

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title || '',
        description: activity.description || '',
        subject: 'Português',
        difficulty: 'Médio',
        format: 'PDF',
        duration: '30 minutos',
        objectives: '',
        materials: '',
        instructions: '',
        evaluation: ''
      });
    }
  }, [activity]);

  const handleInputChange = (field: keyof ActivityFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBuildActivity = async () => {
    setIsGenerating(true);
    try {
      const { generateActivity, validateFormData } = await import('./activityGeneratorService');

      // Validar dados do formulário
      const errors = validateFormData(formData);
      if (errors.length > 0) {
        console.error('Erros de validação:', errors);
        setIsGenerating(false);
        return;
      }

      // Gerar atividade usando o serviço
      const result = await generateActivity(formData);
      setGeneratedActivity(result.content);
      setIsGenerating(false);
    } catch (error) {
      console.error('Erro ao gerar atividade:', error);
      setIsGenerating(false);
    }
  };

  const handleSaveChanges = () => {
    const activityData = {
      ...formData,
      generatedContent: generatedActivity
    };
    onSave(activityData);
    onClose();
  };

  // Converter formData em formato para ActivityPreview
  const getActivityPreviewData = () => {
    return {
      title: formData.title,
      description: formData.description,
      difficulty: formData.difficulty,
      timeLimit: formData.duration,
      instructions: formData.instructions,
      materials: formData.materials ? formData.materials.split('\n').filter(m => m.trim()) : [],
      objective: formData.objectives,
      targetAudience: 'Estudantes',
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
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'editar' | 'visualizar')} className="w-full">
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
              </TabsList>

              {/* Content */}
              <div className="p-6 h-[calc(800px-180px)] overflow-hidden">
                <TabsContent value="editar" className="mt-0 h-full">
                  <div className="flex gap-6 h-full">
                    {/* Formulário (50%) */}
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
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor="difficulty" className="text-sm">Dificuldade</Label>
                                <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                                  <SelectTrigger className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                                    <SelectValue placeholder="Selecione a dificuldade" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                    <SelectItem value="Fácil">Fácil</SelectItem>
                                    <SelectItem value="Médio">Médio</SelectItem>
                                    <SelectItem value="Difícil">Difícil</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="format" className="text-sm">Formato de Entrega</Label>
                                <Select value={formData.format} onValueChange={(value) => handleInputChange('format', value)}>
                                  <SelectTrigger className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                                    <SelectValue placeholder="Selecione o formato" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                    <SelectItem value="PDF">PDF Imprimível</SelectItem>
                                    <SelectItem value="Interativo">Interativo</SelectItem>
                                    <SelectItem value="Vídeo">Vídeo Explicativo</SelectItem>
                                    <SelectItem value="Apresentação">Apresentação</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor="duration" className="text-sm">Duração Estimada</Label>
                                <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                                  <SelectTrigger className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                                    <SelectValue placeholder="Selecione a duração" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                    <SelectItem value="15 minutos">15 minutos</SelectItem>
                                    <SelectItem value="30 minutos">30 minutos</SelectItem>
                                    <SelectItem value="45 minutos">45 minutos</SelectItem>
                                    <SelectItem value="1 hora">1 hora</SelectItem>
                                    <SelectItem value="2 horas">2 horas</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

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
                          </div>
                        </CardContent>
                      </Card>

                      <Button
                        onClick={handleBuildActivity}
                        disabled={isGenerating}
                        className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-semibold py-3"
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Gerando...
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
                              className="text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Baixar PDF
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Exportar
                            </Button>
                          </div>
                        </div>

                        <div className="border rounded-lg p-6 h-[calc(100%-100px)] overflow-y-auto bg-white dark:bg-gray-800">
                          <ActivityPreview activityData={getActivityPreviewData()} />
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
            <div className="flex justify-end space-x-3">
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
                Salvar Alterações
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditActivityModal;
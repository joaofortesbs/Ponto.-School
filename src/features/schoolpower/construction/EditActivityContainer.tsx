
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Settings, 
  FileText, 
  Clock, 
  Target,
  BookOpen,
  User,
  Calendar,
  Edit3,
  Plus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isActivityRegistered, getActivityComponents } from '../activities/activityRegistry';

interface EditActivityContainerProps {
  activityId: string;
  activityData?: any;
  onBack: () => void;
  onSave?: (data: any) => void;
  onClose: () => void;
}

interface ActivityFormData {
  title: string;
  description: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  duration: string;
  type: string;
  objective: string;
  targetAudience: string;
  instructions: string;
  materials: string[];
  evaluation: string;
  additionalNotes: string;
}

export function EditActivityContainer({ 
  activityId, 
  activityData, 
  onBack, 
  onSave, 
  onClose 
}: EditActivityContainerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ActivityFormData>({
    title: '',
    description: '',
    difficulty: 'Médio',
    duration: '',
    type: '',
    objective: '',
    targetAudience: '',
    instructions: '',
    materials: [],
    evaluation: '',
    additionalNotes: ''
  });

  const [ActivityEditor, setActivityEditor] = useState<React.ComponentType<any> | null>(null);
  const [ActivityPreview, setActivityPreview] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    console.log('🔍 EditActivityContainer: Carregando componentes para:', activityId);
    console.log('🔍 EditActivityContainer: Dados da atividade:', activityData);

    const loadActivityComponents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Inicializar dados do formulário com dados da atividade se disponíveis
        if (activityData) {
          setFormData(prev => ({
            ...prev,
            title: activityData.title || '',
            description: activityData.description || '',
            type: activityData.type || '',
            duration: activityData.duration?.toString() || '30',
            ...activityData
          }));
        }

        // Verificar se a atividade está registrada
        if (!isActivityRegistered(activityId)) {
          console.log('⚠️ Atividade não registrada, usando componentes padrão');
          
          // Importar componentes padrão
          const { default: DefaultEditor } = await import('../activities/default/EditActivity');
          const { default: DefaultPreview } = await import('../activities/default/ActivityPreview');
          
          setActivityEditor(() => DefaultEditor);
          setActivityPreview(() => DefaultPreview);
        } else {
          console.log('✅ Atividade registrada, carregando componentes específicos');
          
          try {
            const components = getActivityComponents(activityId);
            if (!components) {
              throw new Error('Componentes não encontrados');
            }

            const EditorComponent = components.editor;
            const PreviewComponent = components.preview;

            setActivityEditor(() => EditorComponent);
            setActivityPreview(() => PreviewComponent);
            console.log('✅ Componentes específicos carregados com sucesso');
          } catch (componentError) {
            console.error('❌ Erro ao carregar componentes específicos:', componentError);
            
            // Fallback para componentes padrão
            const { default: DefaultEditor } = await import('../activities/default/EditActivity');
            const { default: DefaultPreview } = await import('../activities/default/ActivityPreview');
            
            setActivityEditor(() => DefaultEditor);
            setActivityPreview(() => DefaultPreview);
          }
        }
      } catch (generalError) {
        console.error('❌ Erro geral ao carregar componentes:', generalError);
        setError(`Erro inesperado ao carregar a atividade "${activityId}".`);
      } finally {
        setLoading(false);
      }
    };

    if (activityId) {
      loadActivityComponents();
    } else {
      setError('ID da atividade não fornecido.');
      setLoading(false);
    }
  }, [activityId, activityData]);

  const handleSave = () => {
    console.log('💾 Salvando dados da atividade:', activityId, formData);
    onSave?.(formData);
  };

  const handleFormChange = (field: keyof ActivityFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, '']
    }));
  };

  const updateMaterial = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map((material, i) => i === index ? value : material)
    }));
  };

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Médio': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Difícil': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF6B00] mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">Carregando editor da atividade...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Erro ao Carregar</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button onClick={onBack} variant="outline" size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 z-50">
      {/* Header moderno */}
      <div className="sticky top-0 z-60 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 shadow-md"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Construção de Atividades
              </h1>
              <div className="flex items-center space-x-3 mt-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[300px]">
                  Editando: {formData.title || activityId}
                </p>
                <Badge className={getDifficultyColor(formData.difficulty)} variant="secondary">
                  {formData.difficulty}
                </Badge>
                {formData.duration && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {formData.duration} min
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose} size="sm" className="shadow-md">
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#D65A00] hover:to-[#FF6B00] text-white shadow-lg transition-all duration-200" 
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex h-[calc(100vh-88px)] overflow-hidden">
        {/* Left Side - Editor */}
        <div className="w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-700">
          {/* Editor Header */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center">
                <Edit3 className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Editor</h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
              {/* Informações Básicas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <Card className="border-0 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4 bg-gradient-to-r from-[#FF6B00]/10 to-[#FF8C40]/10 rounded-t-lg">
                    <CardTitle className="flex items-center text-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center mr-3">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      Informações Básicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Título da Atividade
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                        placeholder="Digite o título da atividade"
                        className="mt-2 border-gray-200 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00] focus:ring-2 transition-all duration-200 rounded-lg bg-white/80 dark:bg-gray-900/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Descrição
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        placeholder="Descreva a atividade"
                        rows={3}
                        className="mt-2 border-gray-200 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00] focus:ring-2 transition-all duration-200 rounded-lg bg-white/80 dark:bg-gray-900/50 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="difficulty" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Nível de Dificuldade
                        </Label>
                        <Select
                          value={formData.difficulty}
                          onValueChange={(value) => handleFormChange('difficulty', value)}
                        >
                          <SelectTrigger className="mt-2 border-gray-200 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00] focus:ring-2 transition-all duration-200 rounded-lg bg-white/80 dark:bg-gray-900/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fácil">Fácil</SelectItem>
                            <SelectItem value="Médio">Médio</SelectItem>
                            <SelectItem value="Difícil">Difícil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="duration" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Duração (minutos)
                        </Label>
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) => handleFormChange('duration', e.target.value)}
                          placeholder="30"
                          className="mt-2 border-gray-200 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
                        />
                      </div>

                      <div>
                        <Label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tipo de Atividade
                        </Label>
                        <Input
                          id="type"
                          value={formData.type}
                          onChange={(e) => handleFormChange('type', e.target.value)}
                          placeholder="Ex: Exercício, Prova, Jogo"
                          className="mt-2 border-gray-200 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Configurações Específicas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="w-full"
              >
                <Card className="border-0 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-t-lg">
                    <CardTitle className="flex items-center text-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      Configurações Específicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="objective" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Objetivo da Atividade
                      </Label>
                      <Textarea
                        id="objective"
                        value={formData.objective}
                        onChange={(e) => handleFormChange('objective', e.target.value)}
                        placeholder="Descreva o objetivo pedagógico"
                        rows={2}
                        className="mt-2 border-gray-200 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="targetAudience" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Público-Alvo
                      </Label>
                      <Input
                        id="targetAudience"
                        value={formData.targetAudience}
                        onChange={(e) => handleFormChange('targetAudience', e.target.value)}
                        placeholder="Ex: 8º ano, Ensino Médio"
                        className="mt-2 border-gray-200 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="instructions" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Instruções para o Aluno
                      </Label>
                      <Textarea
                        id="instructions"
                        value={formData.instructions}
                        onChange={(e) => handleFormChange('instructions', e.target.value)}
                        placeholder="Instruções detalhadas para realização da atividade"
                        rows={4}
                        className="mt-2 border-gray-200 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Materiais e Recursos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="w-full"
              >
                <Card className="border-0 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-t-lg">
                    <CardTitle className="flex items-center text-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      Materiais e Recursos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Materiais Necessários
                        </Label>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={addMaterial}
                          className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {formData.materials.map((material, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <Input
                              value={material}
                              onChange={(e) => updateMaterial(index, e.target.value)}
                              placeholder="Ex: Calculadora, Régua, etc."
                              className="flex-1 border-gray-200 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeMaterial(index)}
                              className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {formData.materials.length === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            Nenhum material adicionado
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="evaluation" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Critérios de Avaliação
                      </Label>
                      <Textarea
                        id="evaluation"
                        value={formData.evaluation}
                        onChange={(e) => handleFormChange('evaluation', e.target.value)}
                        placeholder="Como a atividade será avaliada"
                        rows={3}
                        className="mt-2 border-gray-200 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="additionalNotes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Observações Adicionais
                      </Label>
                      <Textarea
                        id="additionalNotes"
                        value={formData.additionalNotes}
                        onChange={(e) => handleFormChange('additionalNotes', e.target.value)}
                        placeholder="Informações extras, dicas para o professor, etc."
                        rows={2}
                        className="mt-2 border-gray-200 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Componente específico da atividade */}
              {ActivityEditor && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="w-full"
                >
                  <Card className="border-0 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="pb-4 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-t-lg">
                      <CardTitle className="flex items-center text-lg">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                          <Settings className="w-4 h-4 text-white" />
                        </div>
                        Configurações Específicas da Atividade
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ActivityEditor 
                        activityData={formData}
                        activityId={activityId}
                        onChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Preview */}
        <div className="w-1/2 flex flex-col">
          {/* Preview Header */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Visualização
              </h2>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm h-full">
                <CardContent className="p-6 h-full overflow-y-auto">
                  {ActivityPreview && (
                    <ActivityPreview 
                      activityData={formData}
                      activityId={activityId}
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

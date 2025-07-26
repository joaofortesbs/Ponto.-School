
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
  ChevronLeft,
  ChevronRight
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B00] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando editor da atividade...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Erro ao Carregar</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Main Header */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Construção de Atividades
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Editando: {formData.title || activityId}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-[#FF6B00] hover:bg-[#D65A00]">
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Content Container with fixed header offset */}
      <div className="flex w-full pt-16">
        {/* Left Side - Editor with Sidebar */}
        <div className="w-1/2 flex bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          {/* Sidebar dentro da área de edição */}
          <motion.div
            initial={{ width: sidebarCollapsed ? 60 : 280 }}
            animate={{ width: sidebarCollapsed ? 60 : 280 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex-shrink-0"
          >
            {/* Sidebar Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
              {!sidebarCollapsed && (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Editor
                </h2>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 h-8 w-8"
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
            </div>

            {/* Sidebar Navigation */}
            <div className="p-2 space-y-1">
              <Button
                variant="default"
                className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
              >
                <Edit3 className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-2">Editor</span>}
              </Button>
            </div>

            {!sidebarCollapsed && (
              <>
                <Separator className="my-4" />
                
                {/* Activity Info */}
                <div className="px-4 space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      ATIVIDADE
                    </Label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {formData.title || 'Nova Atividade'}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      TIPO
                    </Label>
                    <Badge variant="secondary" className="mt-1">
                      {formData.type || 'Não definido'}
                    </Badge>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      DURAÇÃO
                    </Label>
                    <div className="flex items-center mt-1">
                      <Clock className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {formData.duration || '30'} min
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      DIFICULDADE
                    </Label>
                    <Badge 
                      variant={formData.difficulty === 'Fácil' ? 'default' : formData.difficulty === 'Médio' ? 'secondary' : 'destructive'}
                      className="mt-1"
                    >
                      {formData.difficulty}
                    </Badge>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* Editor Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Informações Básicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título da Atividade</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                        placeholder="Digite o título da atividade"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        placeholder="Descreva a atividade"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="difficulty">Nível de Dificuldade</Label>
                        <Select
                          value={formData.difficulty}
                          onValueChange={(value) => handleFormChange('difficulty', value)}
                        >
                          <SelectTrigger>
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
                        <Label htmlFor="duration">Duração Estimada (minutos)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) => handleFormChange('duration', e.target.value)}
                          placeholder="30"
                        />
                      </div>

                      <div>
                        <Label htmlFor="type">Tipo de Atividade</Label>
                        <Input
                          id="type"
                          value={formData.type}
                          onChange={(e) => handleFormChange('type', e.target.value)}
                          placeholder="Ex: Exercício, Prova, Jogo"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Configurações Específicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="objective">Objetivo da Atividade</Label>
                      <Textarea
                        id="objective"
                        value={formData.objective}
                        onChange={(e) => handleFormChange('objective', e.target.value)}
                        placeholder="Descreva o objetivo pedagógico"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="targetAudience">Público-Alvo</Label>
                      <Input
                        id="targetAudience"
                        value={formData.targetAudience}
                        onChange={(e) => handleFormChange('targetAudience', e.target.value)}
                        placeholder="Ex: 8º ano, Ensino Médio"
                      />
                    </div>

                    <div>
                      <Label htmlFor="instructions">Instruções para o Aluno</Label>
                      <Textarea
                        id="instructions"
                        value={formData.instructions}
                        onChange={(e) => handleFormChange('instructions', e.target.value)}
                        placeholder="Instruções detalhadas para realização da atividade"
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Materiais e Recursos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Materiais Necessários</Label>
                        <Button variant="outline" size="sm" onClick={addMaterial}>
                          Adicionar Material
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {formData.materials.map((material, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={material}
                              onChange={(e) => updateMaterial(index, e.target.value)}
                              placeholder="Ex: Calculadora, Régua, etc."
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeMaterial(index)}
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                        {formData.materials.length === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Nenhum material adicionado
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="evaluation">Critérios de Avaliação</Label>
                      <Textarea
                        id="evaluation"
                        value={formData.evaluation}
                        onChange={(e) => handleFormChange('evaluation', e.target.value)}
                        placeholder="Como a atividade será avaliada"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="additionalNotes">Observações Adicionais</Label>
                      <Textarea
                        id="additionalNotes"
                        value={formData.additionalNotes}
                        onChange={(e) => handleFormChange('additionalNotes', e.target.value)}
                        placeholder="Informações extras, dicas para o professor, etc."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Componente específico da atividade */}
                {ActivityEditor && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Configurações Específicas da Atividade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ActivityEditor 
                        activityData={formData}
                        activityId={activityId}
                        onChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Preview */}
        <div className="w-1/2 bg-gray-50 dark:bg-gray-900">
          <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-6">
            <Eye className="w-5 h-5 mr-2 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Visualização
            </h2>
          </div>
          
          <div className="h-full overflow-y-auto p-6">
            <Card>
              <CardContent className="p-6">
                {ActivityPreview && (
                  <ActivityPreview 
                    activityData={formData}
                    activityId={activityId}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

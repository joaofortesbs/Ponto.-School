import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Eye, Save, Settings, Presentation } from 'lucide-react';

// Importar componentes de atividades
import QuadroInterativoPreview from '../activities/quadro-interativo/QuadroInterativoPreview';
import EditActivity from '../activities/quadro-interativo/EditActivity';

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: any;
  onSave?: (data: any) => void;
}

export default function EditActivityModal({ isOpen, onClose, activity, onSave }: EditActivityModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState('edit');
  const [hasChanges, setHasChanges] = useState(false);

  // Inicializar dados do formulário
  useEffect(() => {
    if (activity && isOpen) {
      console.log('🔄 Inicializando modal com atividade:', activity);

      // Configurar dados padrão baseado no tipo de atividade
      let initialData = {};

      if (activity.id === 'quadro-interativo') {
        initialData = {
          quadroInterativoTitulo: 'Quadro Interativo: Relevo e Formação de Montanhas',
          quadroInterativoDescricao: 'Apresentação interativa sobre os diferentes tipos de relevo e os processos de formação de montanhas, utilizando recursos visuais e atividades práticas.',
          quadroInterativoMateria: 'Geografia',
          quadroInterativoTema: 'Relevo e Formação de Montanhas',
          quadroInterativoAnoEscolar: '6º ano',
          quadroInterativoNumeroQuestoes: 10,
          quadroInterativoNivelDificuldade: 'Médio',
          quadroInterativoModalidadeQuestao: 'Múltipla escolha',
          quadroInterativoCampoEspecifico: 'Geologia e Tectônica de Placas'
        };
      }

      setFormData(initialData);
      setHasChanges(false);
      setActiveTab('edit');
    }
  }, [activity, isOpen]);

  const handleFieldChange = (field: string, value: any) => {
    console.log(`📝 Campo alterado: ${field} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('💾 Salvando dados:', formData);
    if (onSave) {
      onSave({
        ...activity,
        data: formData,
        lastModified: new Date().toISOString()
      });
    }
    setHasChanges(false);
    onClose();
  };

  const handleClose = () => {
    if (hasChanges) {
      const confirm = window.confirm('Você tem alterações não salvas. Deseja realmente fechar?');
      if (!confirm) return;
    }
    setHasChanges(false);
    onClose();
  };

  const renderActivityContent = () => {
    if (!activity) return null;

    switch (activity.id) {
      case 'quadro-interativo':
        return {
          edit: (
            <EditActivity
              data={formData}
              onChange={handleFieldChange}
              onSave={handleSave}
            />
          ),
          preview: (
            <QuadroInterativoPreview
              data={formData}
              activityData={activity}
              activityId={activity.id}
            />
          )
        };

      default:
        return {
          edit: (
            <div className="text-center py-8">
              <p className="text-gray-500">Componente de edição não encontrado para: {activity.id}</p>
            </div>
          ),
          preview: (
            <div className="text-center py-8">
              <p className="text-gray-500">Preview não disponível para: {activity.id}</p>
            </div>
          )
        };
    }
  };

  if (!isOpen || !activity) return null;

  const content = renderActivityContent();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FF6B00] rounded-lg">
                <Presentation className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Editar Materiais - {activity.name}
                </DialogTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Configure os materiais e gere o conteúdo da atividade
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  Alterações pendentes
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
              <TabsList className="bg-gray-100 dark:bg-gray-800">
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Editar
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Pré-visualização
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              <TabsContent value="edit" className="p-6 h-full">
                {content.edit}
              </TabsContent>

              <TabsContent value="preview" className="p-6 h-full">
                {content.preview}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {activity.id}
              </Badge>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-xs text-gray-500">
                Última modificação: {formData.lastModified ? new Date(formData.lastModified).toLocaleString() : 'Nunca'}
              </span>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!hasChanges}
                className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
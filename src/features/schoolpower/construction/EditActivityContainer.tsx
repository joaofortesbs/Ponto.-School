import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  activityRegistry, 
  isActivityRegistered, 
  getActivityComponents 
} from '../activities/activityRegistry';

interface EditActivityContainerProps {
  activityId: string;
  activityData?: any;
  onBack?: () => void;
  onSave?: (data: any) => void;
  onClose?: () => void;
}

export function EditActivityContainer({
  activityId,
  activityData,
  onBack,
  onSave,
  onClose
}: EditActivityContainerProps) {
  const [ActivityEditor, setActivityEditor] = useState<React.ComponentType<any> | null>(null);
  const [ActivityPreview, setActivityPreview] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState(activityData || {});

  console.log('🔍 Buscando atividade pelo ID:', activityId);
  console.log('📋 Atividades registradas:', Object.keys(activityRegistry));

  useEffect(() => {
    const loadActivityComponents = async () => {
      setLoading(true);
      setError(null);

      try {
        // Verificar se a atividade está registrada
        if (!isActivityRegistered(activityId)) {
          console.log('⚠️ Atividade não registrada, usando componentes padrão para:', activityId);

          // Tentar carregar componentes padrão
          try {
            const defaultEditor = await import('../activities/default/EditActivity');
            const defaultPreview = await import('../activities/default/ActivityPreview');

            setActivityEditor(() => defaultEditor.default);
            setActivityPreview(() => defaultPreview.default);
            console.log('✅ Componentes padrão carregados com sucesso');
          } catch (defaultError) {
            console.error('❌ Erro ao carregar componentes padrão:', defaultError);
            setError(`Atividade "${activityId}" não encontrada e componentes padrão indisponíveis.`);
            return;
          }
        } else {
          console.log('✅ Atividade registrada encontrada:', activityId);

          const components = getActivityComponents(activityId);
          if (!components) {
            setError(`Erro interno: componentes não encontrados para "${activityId}".`);
            return;
          }

          // Carregar componentes específicos da atividade
          try {
            const EditorComponent = components.editor;
            const PreviewComponent = components.preview;

            setActivityEditor(() => EditorComponent);
            setActivityPreview(() => PreviewComponent);
            console.log('✅ Componentes específicos carregados com sucesso');
          } catch (componentError) {
            console.error('❌ Erro ao carregar componentes específicos:', componentError);
            setError(`Erro ao carregar componentes da atividade "${activityId}".`);
            return;
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
  }, [activityId]);

  const handleSave = (data: any) => {
    console.log('💾 Salvando dados da atividade:', activityId, data);
    setPreviewData({ ...previewData, ...data });
    onSave?.(data);
  };

  const handlePreview = () => {
    console.log('👁️ Atualizando preview com dados:', previewData);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF6B00]" />
            <span className="text-lg font-medium">Carregando interface de edição...</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Preparando componentes para: {activityId}</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-2xl max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <span className="text-lg font-medium text-red-600">Erro ao carregar atividade</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-6">
            <p className="text-xs text-gray-500 mb-1">ID solicitado:</p>
            <code className="text-sm font-mono">{activityId}</code>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose || onBack}>
              Voltar
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!ActivityEditor || !ActivityPreview) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-2xl max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            <span className="text-lg font-medium">Componentes indisponíveis</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Os componentes de edição e visualização não puderam ser carregados para a atividade {activityId}.
          </p>
          <Button variant="outline" onClick={onClose || onBack}>
            Voltar
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-hidden"
    >
      <div className="h-full bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#FF6B00] to-[#FF9248]">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack || onClose}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="text-white">
              <h1 className="text-lg font-semibold">Editando Atividade</h1>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <span>ID: {activityId}</span>
                {isActivityRegistered(activityId) && (
                  <span className="px-2 py-1 bg-white/20 rounded text-xs">Registrada</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(100vh-80px)]">
          {/* Editor Panel */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                ✏️ Editor
              </h2>
              <Suspense fallback={
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2 text-sm text-gray-500">Carregando editor...</span>
                </div>
              }>
                <ActivityEditor 
                  activityData={previewData}
                  onSave={handleSave}
                  onPreview={handlePreview}
                />
              </Suspense>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="w-1/2 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                👁️ Visualização
              </h2>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <Suspense fallback={
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2 text-sm text-gray-500">Carregando visualização...</span>
                  </div>
                }>
                  <ActivityPreview activityData={previewData} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
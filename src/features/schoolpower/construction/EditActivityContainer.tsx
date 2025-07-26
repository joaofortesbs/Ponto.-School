import React, { useState, Suspense, lazy, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye, Edit3, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditActivityContainerProps {
  activityId: string;
  activity?: any;
  activityData?: any;
  onSave: (data: any) => void;
  onCancel?: () => void;
  onBack?: () => void;
}

// Cache para componentes carregados dinamicamente
const componentCache = new Map();

const schoolPowerActivities = [
  {
    id: 'listening',
    name: 'Listening Activity',
    description: 'An activity to test listening skills.',
    // ... other properties
  },
  {
    id: 'reading',
    name: 'Reading Activity',
    description: 'An activity to improve reading comprehension.',
    // ... other properties
  },
  // ... more activities
];

export function EditActivityContainer({ 
  activityId, 
  activity: propActivity,
  activityData, 
  onBack, 
  onSave 
}: EditActivityContainerProps) {
  const [formData, setFormData] = useState(activityData || {});
  const [isDraft, setIsDraft] = useState(false);
  const [activity, setActivity] = useState<any>(propActivity || null);
  const [loading, setLoading] = useState(!propActivity);

  useEffect(() => {
    // Se a atividade não foi passada como prop, buscar pelo ID
    if (!propActivity) {
      console.log('🔍 Buscando atividade pelo ID:', activityId);
      const foundActivity = schoolPowerActivities.find(a => a.id === activityId);
      if (foundActivity) {
        console.log('✅ Atividade encontrada:', foundActivity);
        setActivity(foundActivity);
      } else {
        console.error('❌ Atividade não encontrada:', activityId);
      }
      setLoading(false);
    } else {
      console.log('✅ Atividade recebida via prop:', propActivity);
      setActivity(propActivity);
      setLoading(false);
    }
  }, [activityId, propActivity]);

  // Função para carregar componentes dinamicamente
  const loadActivityComponents = (id: string) => {
    if (componentCache.has(id)) {
      return componentCache.get(id);
    }

    const EditActivity = lazy(() => 
      import(`../activities/${id}/EditActivity.tsx`)
        .catch(() => import('../activities/default/EditActivity.tsx'))
    );

    const ActivityPreview = lazy(() => 
      import(`../activities/${id}/ActivityPreview.tsx`)
        .catch(() => import('../activities/default/ActivityPreview.tsx'))
    );

    const components = { EditActivity, ActivityPreview };
    componentCache.set(id, components);
    return components;
  };

  const { EditActivity, ActivityPreview } = loadActivityComponents(activityId);

  const handleFormChange = (newData: any) => {
    setFormData({ ...formData, ...newData });
    setIsDraft(true);
  };

  const handleSave = () => {
    onSave(formData);
    setIsDraft(false);
  };

  const handleSaveDraft = () => {
    // Implementar salvamento de rascunho no localStorage ou backend
    localStorage.setItem(`activity_draft_${activityId}`, JSON.stringify(formData));
    setIsDraft(false);
  };

  if (loading) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Carregando atividade...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-sm text-red-600 dark:text-red-400">
            Atividade não encontrada (ID: {activityId})
          </p>
          <Button variant="outline" onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Editando Atividade
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ID: {activityId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isDraft && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Rascunho
            </Button>
          )}
          <Button
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white"
          >
            <Save className="w-4 h-4" />
            Concluir Construção
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Panel - Form */}
        <div className="w-[45%] border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Edit3 className="w-5 h-5 text-[#FF6B00]" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configurar Atividade
              </h2>
            </div>

            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
              </div>
            }>
              <EditActivity
                data={formData}
                onChange={handleFormChange}
              />
            </Suspense>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-[55%] overflow-y-auto bg-gray-50 dark:bg-gray-800">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-[#FF6B00]" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Visualização ao Vivo
              </h2>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 min-h-96">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
                </div>
              }>
                <ActivityPreview
                  data={formData}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
import React, { useState, useEffect, Suspense } from 'react';
import { X, Save, Eye, Loader2, Sparkles, BookOpen, Target, Clock, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { ConstructionActivity } from './types';

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ConstructionActivity | null;
  onSave: (activity: ConstructionActivity) => void;
}

const activityRegistry = {
  "lista-exercicios": {
    editor: React.lazy(() => import("../activities/default/EditActivity")),
    preview: React.lazy(() => import("../activities/default/ActivityPreview")),
  },
  "prova": {
    editor: React.lazy(() => import("../activities/default/EditActivity")),
    preview: React.lazy(() => import("../activities/default/ActivityPreview")),
  },
  "revisao-guiada": {
    editor: React.lazy(() => import("../activities/default/EditActivity")),
    preview: React.lazy(() => import("../activities/default/ActivityPreview")),
  },
  "jogos-educativos": {
    editor: React.lazy(() => import("../activities/default/EditActivity")),
    preview: React.lazy(() => import("../activities/default/ActivityPreview")),
  },
  "sequencia-didatica": {
    editor: React.lazy(() => import("../activities/default/EditActivity")),
    preview: React.lazy(() => import("../activities/default/ActivityPreview")),
  },
  "texto-apoio": {
    editor: React.lazy(() => import("../activities/default/EditActivity")),
    preview: React.lazy(() => import("../activities/default/ActivityPreview")),
  },
  "exemplos-contextualizados": {
    editor: React.lazy(() => import("../activities/default/EditActivity")),
    preview: React.lazy(() => import("../activities/default/ActivityPreview")),
  },
  "mapa-mental": {
    editor: React.lazy(() => import("../activities/default/EditActivity")),
    preview: React.lazy(() => import("../activities/default/ActivityPreview")),
  },
  "proposta-redacao": {
    editor: React.lazy(() => import("../activities/default/EditActivity")),
    preview: React.lazy(() => import("../activities/default/ActivityPreview")),
  },
  "criterios-avaliacao": {
    editor: React.lazy(() => import("../activities/default/EditActivity")),
    preview: React.lazy(() => import("../activities/default/ActivityPreview")),
  },
};

export function EditActivityModal({ isOpen, onClose, activity, onSave }: EditActivityModalProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isLoading, setIsLoading] = useState(false);
  const [activityData, setActivityData] = useState<any>(null);

  useEffect(() => {
    if (activity) {
      setActivityData(activity.originalData || {});
    }
  }, [activity]);

  if (!isOpen || !activity) return null;

  const isDark = theme === 'dark';

  // Componentes dinâmicos baseados no tipo de atividade
  const ActivityEditor = activityRegistry[activity.type as keyof typeof activityRegistry]?.editor;
  const ActivityPreview = activityRegistry[activity.type as keyof typeof activityRegistry]?.preview;

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave({
        ...activity,
        status: 'completed',
        progress: 100,
        originalData: activityData
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop com blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 backdrop-blur-sm transition-all duration-300 ${
            isDark 
              ? 'bg-black/60' 
              : 'bg-white/30'
          }`}
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className={`relative w-[95vw] h-[90vh] max-w-7xl mx-4 rounded-2xl shadow-2xl border transition-all duration-300 ${
            isDark
              ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700/50 shadow-black/50'
              : 'bg-gradient-to-br from-white via-gray-50 to-white border-gray-200/60 shadow-gray-900/10'
          }`}
        >
          {/* Header Premium */}
          <div className={`relative px-8 py-6 border-b backdrop-blur-sm ${
            isDark
              ? 'border-gray-700/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80'
              : 'border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-white/80'
          }`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className={`w-full h-full ${
                isDark 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                  : 'bg-gradient-to-r from-blue-400 to-indigo-500'
              }`} />
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl shadow-lg transition-all duration-300 ${
                  isDark
                    ? 'bg-gradient-to-br from-orange-500 to-red-600 shadow-orange-500/20'
                    : 'bg-gradient-to-br from-orange-400 to-red-500 shadow-orange-400/20'
                }`}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>

                <div>
                  <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Editar Atividade
                  </h2>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {activity.title}
                  </p>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="flex items-center space-x-6">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  isDark
                    ? 'bg-gray-700/50 border border-gray-600/30'
                    : 'bg-white/70 border border-gray-200/50'
                }`}>
                  <Target className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {activity.progress}% Concluído
                  </span>
                </div>

                <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  isDark
                    ? 'bg-gray-700/50 border border-gray-600/30'
                    : 'bg-white/70 border border-gray-200/50'
                }`}>
                  <Clock className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Status: {activity.status}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                  isDark
                    ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100/80 text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className={`px-8 py-4 border-b transition-all duration-300 ${
            isDark
              ? 'border-gray-700/50 bg-gray-800/30'
              : 'border-gray-200/60 bg-gray-50/30'
          }`}>
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'edit'
                    ? isDark
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20'
                      : 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg shadow-orange-400/20'
                    : isDark
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Editar</span>
              </button>

              <button
                onClick={() => setActiveTab('preview')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'preview'
                    ? isDark
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20'
                      : 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg shadow-orange-400/20'
                    : isDark
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Visualizar</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className={`flex-1 overflow-hidden ${
            isDark ? 'bg-gray-900/50' : 'bg-gray-50/30'
          }`}>
            <div className="h-full p-8 overflow-y-auto">
              <Suspense 
                fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center space-y-4">
                      <Loader2 className={`w-8 h-8 animate-spin ${
                        isDark ? 'text-orange-400' : 'text-orange-500'
                      }`} />
                      <p className={`text-sm font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Carregando editor...
                      </p>
                    </div>
                  </div>
                }
              >
                {activeTab === 'edit' && ActivityEditor && (
                  <ActivityEditor
                    activityData={activityData}
                    activityId={activity.id}
                    onDataChange={setActivityData}
                  />
                )}

                {activeTab === 'preview' && ActivityPreview && (
                  <ActivityPreview
                    activityData={activityData}
                    activityId={activity.id}
                  />
                )}
              </Suspense>
            </div>
          </div>

          {/* Footer com Actions */}
          <div className={`px-8 py-6 border-t transition-all duration-300 ${
            isDark
              ? 'border-gray-700/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80'
              : 'border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-white/80'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Award className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
                <span className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Atividade em construção - School Power
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={onClose}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isDark
                      ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white border border-gray-600/30'
                      : 'bg-white/80 text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/50'
                  }`}
                >
                  Cancelar
                </button>

                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg ${
                    isDark
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-orange-500/20'
                      : 'bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white shadow-orange-400/20'
                  } ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Salvar Atividade</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
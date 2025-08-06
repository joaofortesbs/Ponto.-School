
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Edit3, Download, Share2, Copy, Calendar, Clock, User, BookOpen, Target, Lightbulb, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/components/ThemeProvider';
import { ConstructionActivity } from './types';
import ActivityPreview from '@/features/schoolpower/activities/default/ActivityPreview';
import ExerciseListPreview from '@/features/schoolpower/activities/lista-exercicios/ExerciseListPreview';

interface ActivityViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ConstructionActivity | null;
  onEdit?: (activity: ConstructionActivity) => void;
  onDuplicate?: (activity: ConstructionActivity) => void;
  onExport?: (activity: ConstructionActivity) => void;
  onShare?: (activity: ConstructionActivity) => void;
}

const ActivityViewModal: React.FC<ActivityViewModalProps> = ({
  isOpen,
  onClose,
  activity,
  onEdit,
  onDuplicate,
  onExport,
  onShare
}) => {
  const { theme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'details' | 'metadata'>('preview');
  const modalRef = useRef<HTMLDivElement>(null);

  if (!activity) return null;

  const isDark = theme === 'dark';

  const getActivityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'lista-exercicios':
      case 'lista_exercicios':
        return <BookOpen className="w-5 h-5" />;
      case 'prova':
      case 'avaliacao':
        return <Target className="w-5 h-5" />;
      case 'jogo':
      case 'jogos':
        return <Lightbulb className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'lista-exercicios':
      case 'lista_exercicios':
        return 'Lista de Exercícios';
      case 'prova':
      case 'avaliacao':
        return 'Prova/Avaliação';
      case 'jogo':
      case 'jogos':
        return 'Jogo Educativo';
      default:
        return 'Atividade';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'facil':
      case 'fácil':
        return isDark 
          ? 'bg-green-900/20 text-green-400 border-green-700/50' 
          : 'bg-green-100 text-green-800 border-green-300';
      case 'medio':
      case 'médio':
        return isDark 
          ? 'bg-yellow-900/20 text-yellow-400 border-yellow-700/50' 
          : 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'dificil':
      case 'difícil':
        return isDark 
          ? 'bg-red-900/20 text-red-400 border-red-700/50' 
          : 'bg-red-100 text-red-800 border-red-300';
      default:
        return isDark 
          ? 'bg-blue-900/20 text-blue-400 border-blue-700/50' 
          : 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(activity.id);
  };

  const renderActivityPreview = () => {
    if (activity.type === 'lista-exercicios' || activity.type === 'lista_exercicios') {
      return (
        <ExerciseListPreview 
          data={activity.data}
          customFields={activity.customFields}
        />
      );
    }
    
    return (
      <ActivityPreview 
        activity={activity}
        isPreview={true}
      />
    );
  };

  const tabs = [
    { id: 'preview', label: 'Visualização', icon: <Eye className="w-4 h-4" /> },
    { id: 'details', label: 'Detalhes', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'metadata', label: 'Metadados', icon: <Calendar className="w-4 h-4" /> }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
            isDark 
              ? 'bg-black/80 backdrop-blur-sm' 
              : 'bg-black/50 backdrop-blur-sm'
          }`}
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
            className={`relative w-full max-w-7xl h-[90vh] ${
              isFullscreen ? 'max-w-none h-screen' : ''
            } ${
              isDark 
                ? 'bg-slate-900 border-slate-800' 
                : 'bg-white border-slate-200'
            } border rounded-2xl shadow-2xl overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              isDark 
                ? 'border-slate-800 bg-slate-900/50' 
                : 'border-slate-200 bg-slate-50/50'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  isDark 
                    ? 'bg-blue-900/30 text-blue-400' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div>
                  <h2 className={`text-xl font-semibold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {activity.title || 'Atividade sem título'}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={`${
                      isDark 
                        ? 'bg-slate-800 text-slate-300 border-slate-700' 
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      {getActivityTypeLabel(activity.type)}
                    </Badge>
                    {activity.data?.dificuldade && (
                      <Badge className={`border ${getDifficultyColor(activity.data.dificuldade)}`}>
                        {activity.data.dificuldade}
                      </Badge>
                    )}
                    <button
                      onClick={handleCopyId}
                      className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                        isDark 
                          ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800' 
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Copiar ID"
                    >
                      <Copy className="w-3 h-3" />
                      ID: {activity.id.slice(0, 8)}...
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className={`${
                    isDark 
                      ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(activity)}
                    className={`${
                      isDark 
                        ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                )}

                {onExport && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onExport(activity)}
                    className={`${
                      isDark 
                        ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}

                {onShare && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onShare(activity)}
                    className={`${
                      isDark 
                        ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className={`${
                    isDark 
                      ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className={`flex border-b ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? isDark
                        ? 'border-blue-500 text-blue-400 bg-slate-800/50'
                        : 'border-blue-500 text-blue-600 bg-blue-50/50'
                      : isDark
                        ? 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === 'preview' && (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <ScrollArea className="h-full">
                      <div className={`p-6 ${
                        isDark ? 'bg-slate-900' : 'bg-white'
                      }`}>
                        {renderActivityPreview()}
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}

                {activeTab === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <ScrollArea className="h-full">
                      <div className="p-6 space-y-6">
                        {/* Basic Information */}
                        <Card className={`${
                          isDark 
                            ? 'bg-slate-800/50 border-slate-700' 
                            : 'bg-slate-50 border-slate-200'
                        }`}>
                          <CardHeader>
                            <CardTitle className={`text-lg ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              Informações Básicas
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className={`text-sm font-medium ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                  Título
                                </label>
                                <p className={`mt-1 ${
                                  isDark ? 'text-slate-200' : 'text-slate-900'
                                }`}>
                                  {activity.title || 'Não especificado'}
                                </p>
                              </div>
                              <div>
                                <label className={`text-sm font-medium ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                  Tipo
                                </label>
                                <p className={`mt-1 ${
                                  isDark ? 'text-slate-200' : 'text-slate-900'
                                }`}>
                                  {getActivityTypeLabel(activity.type)}
                                </p>
                              </div>
                              {activity.data?.disciplina && (
                                <div>
                                  <label className={`text-sm font-medium ${
                                    isDark ? 'text-slate-300' : 'text-slate-700'
                                  }`}>
                                    Disciplina
                                  </label>
                                  <p className={`mt-1 ${
                                    isDark ? 'text-slate-200' : 'text-slate-900'
                                  }`}>
                                    {activity.data.disciplina}
                                  </p>
                                </div>
                              )}
                              {activity.data?.tema && (
                                <div>
                                  <label className={`text-sm font-medium ${
                                    isDark ? 'text-slate-300' : 'text-slate-700'
                                  }`}>
                                    Tema
                                  </label>
                                  <p className={`mt-1 ${
                                    isDark ? 'text-slate-200' : 'text-slate-900'
                                  }`}>
                                    {activity.data.tema}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {activity.data?.descricao && (
                              <div>
                                <label className={`text-sm font-medium ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                  Descrição
                                </label>
                                <p className={`mt-1 text-sm leading-relaxed ${
                                  isDark ? 'text-slate-300' : 'text-slate-600'
                                }`}>
                                  {activity.data.descricao}
                                </p>
                              </div>
                            )}

                            {activity.data?.objetivos && (
                              <div>
                                <label className={`text-sm font-medium ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                  Objetivos
                                </label>
                                <p className={`mt-1 text-sm leading-relaxed ${
                                  isDark ? 'text-slate-300' : 'text-slate-600'
                                }`}>
                                  {activity.data.objetivos}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Activity Specific Data */}
                        {Object.keys(activity.data || {}).length > 0 && (
                          <Card className={`${
                            isDark 
                              ? 'bg-slate-800/50 border-slate-700' 
                              : 'bg-slate-50 border-slate-200'
                          }`}>
                            <CardHeader>
                              <CardTitle className={`text-lg ${
                                isDark ? 'text-white' : 'text-slate-900'
                              }`}>
                                Dados da Atividade
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(activity.data || {}).map(([key, value]) => {
                                  if (['titulo', 'descricao', 'objetivos', 'disciplina', 'tema'].includes(key)) return null;
                                  
                                  return (
                                    <div key={key}>
                                      <label className={`text-sm font-medium capitalize ${
                                        isDark ? 'text-slate-300' : 'text-slate-700'
                                      }`}>
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                      </label>
                                      <p className={`mt-1 text-sm ${
                                        isDark ? 'text-slate-200' : 'text-slate-900'
                                      }`}>
                                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}

                {activeTab === 'metadata' && (
                  <motion.div
                    key="metadata"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <ScrollArea className="h-full">
                      <div className="p-6">
                        <Card className={`${
                          isDark 
                            ? 'bg-slate-800/50 border-slate-700' 
                            : 'bg-slate-50 border-slate-200'
                        }`}>
                          <CardHeader>
                            <CardTitle className={`text-lg ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              Metadados da Atividade
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className={`text-sm font-medium ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                  ID da Atividade
                                </label>
                                <div className="flex items-center gap-2 mt-1">
                                  <code className={`text-sm px-2 py-1 rounded ${
                                    isDark 
                                      ? 'bg-slate-900 text-slate-300' 
                                      : 'bg-slate-200 text-slate-700'
                                  }`}>
                                    {activity.id}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopyId}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div>
                                <label className={`text-sm font-medium ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                  Status
                                </label>
                                <Badge className={`mt-1 ${
                                  activity.status === 'completed' 
                                    ? isDark
                                      ? 'bg-green-900/20 text-green-400 border-green-700/50'
                                      : 'bg-green-100 text-green-800 border-green-300'
                                    : isDark
                                      ? 'bg-yellow-900/20 text-yellow-400 border-yellow-700/50'
                                      : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                } border`}>
                                  {activity.status === 'completed' ? 'Concluída' : 'Em Progresso'}
                                </Badge>
                              </div>

                              {activity.createdAt && (
                                <div>
                                  <label className={`text-sm font-medium ${
                                    isDark ? 'text-slate-300' : 'text-slate-700'
                                  }`}>
                                    Data de Criação
                                  </label>
                                  <p className={`mt-1 text-sm ${
                                    isDark ? 'text-slate-200' : 'text-slate-900'
                                  }`}>
                                    {new Date(activity.createdAt).toLocaleString('pt-BR')}
                                  </p>
                                </div>
                              )}

                              {activity.updatedAt && (
                                <div>
                                  <label className={`text-sm font-medium ${
                                    isDark ? 'text-slate-300' : 'text-slate-700'
                                  }`}>
                                    Última Atualização
                                  </label>
                                  <p className={`mt-1 text-sm ${
                                    isDark ? 'text-slate-200' : 'text-slate-900'
                                  }`}>
                                    {new Date(activity.updatedAt).toLocaleString('pt-BR')}
                                  </p>
                                </div>
                              )}
                            </div>

                            <Separator className={`${
                              isDark ? 'bg-slate-700' : 'bg-slate-200'
                            }`} />

                            {/* Custom Fields */}
                            {activity.customFields && Object.keys(activity.customFields).length > 0 && (
                              <div>
                                <h4 className={`text-sm font-medium mb-3 ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                  Campos Personalizados
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {Object.entries(activity.customFields).map(([key, value]) => (
                                    <div key={key}>
                                      <label className={`text-sm font-medium capitalize ${
                                        isDark ? 'text-slate-400' : 'text-slate-600'
                                      }`}>
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                      </label>
                                      <p className={`mt-1 text-sm ${
                                        isDark ? 'text-slate-200' : 'text-slate-900'
                                      }`}>
                                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Generation Info */}
                            {activity.data?.isGeneratedByAI && (
                              <div>
                                <h4 className={`text-sm font-medium mb-3 ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                  Informações de Geração
                                </h4>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={`${
                                    isDark 
                                      ? 'bg-purple-900/20 text-purple-400 border-purple-700/50' 
                                      : 'bg-purple-100 text-purple-800 border-purple-300'
                                  } border`}>
                                    Gerado por IA
                                  </Badge>
                                </div>
                                {activity.data?.generatedAt && (
                                  <p className={`text-sm ${
                                    isDark ? 'text-slate-400' : 'text-slate-600'
                                  }`}>
                                    Gerado em: {new Date(activity.data.generatedAt).toLocaleString('pt-BR')}
                                  </p>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ActivityViewModal;

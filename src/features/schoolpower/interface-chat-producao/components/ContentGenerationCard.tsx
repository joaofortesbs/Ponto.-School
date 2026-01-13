/**
 * CONTENT GENERATION CARD
 * 
 * Card visual que exibe o progresso da geração de conteúdo
 * para cada atividade decidida.
 * 
 * Integra com a capability gerar_conteudo_atividades.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  FileText, 
  Zap,
  ChevronDown,
  ChevronUp,
  Play,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChosenActivitiesStore } from '../stores/ChosenActivitiesStore';
import { gerarConteudoAtividades } from '../../agente-jota/capabilities/GERAR_CONTEUDO/implementations/gerar-conteudo-atividades';

interface ActivityFromCard {
  id: string;
  titulo: string;
  tipo?: string;
  status?: string;
  progresso?: number;
}

interface ContentGenerationCardProps {
  sessionId: string;
  conversationContext: string;
  userObjective: string;
  initialActivities?: ActivityFromCard[];
  autoStart?: boolean;
  onComplete?: (results: any) => void;
  onError?: (error: string) => void;
}

interface ActivityProgress {
  id: string;
  title: string;
  status: 'waiting' | 'generating' | 'completed' | 'error';
  progress: number;
  fieldsGenerated: string[];
  error?: string;
}

export const ContentGenerationCard: React.FC<ContentGenerationCardProps> = ({
  sessionId,
  conversationContext,
  userObjective,
  initialActivities = [],
  autoStart = false,
  onComplete,
  onError
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('Aguardando início...');
  const [activitiesProgress, setActivitiesProgress] = useState<ActivityProgress[]>([]);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Usar selectors para reatividade ao store
  const storeActivities = useChosenActivitiesStore(state => state.chosenActivities);
  const isContentGenerationComplete = useChosenActivitiesStore(state => state.isContentGenerationComplete);
  const markContentGenerationComplete = useChosenActivitiesStore(state => state.markContentGenerationComplete);

  // Usar atividades do store se disponíveis, senão usar initialActivities das props
  // NÃO modifica o store - apenas para renderização
  const activitiesSource = storeActivities.length > 0 ? storeActivities : initialActivities;
  
  // Determina se temos atividades para exibir (de qualquer fonte)
  const hasActivities = activitiesSource.length > 0;

  // Sincronizar progresso local com atividades disponíveis
  useEffect(() => {
    if (activitiesSource.length > 0) {
      const mapStatus = (a: any): 'waiting' | 'generating' | 'completed' | 'error' => {
        if ('status_construcao' in a) {
          if (a.status_construcao === 'concluida') return 'completed';
          if (a.status_construcao === 'construindo') return 'generating';
          if (a.status_construcao === 'erro') return 'error';
        }
        return 'waiting';
      };

      setActivitiesProgress(activitiesSource.map(a => ({
        id: a.id,
        title: 'titulo' in a ? a.titulo : (a as any).titulo || 'Atividade',
        status: mapStatus(a),
        progress: ('progresso' in a ? a.progresso : 0) || 0,
        fieldsGenerated: ('campos_preenchidos' in a && a.campos_preenchidos) ? Object.keys(a.campos_preenchidos) : []
      })));
    }
  }, [activitiesSource]);

  // Verificar se geração já foi concluída
  useEffect(() => {
    if (isContentGenerationComplete) {
      setGenerationComplete(true);
      setOverallProgress(100);
      setCurrentMessage('Geração de conteúdo concluída!');
    }
  }, [isContentGenerationComplete]);

  const handleProgressUpdate = useCallback((update: any) => {
    switch (update.type) {
      case 'activity_started':
        setCurrentMessage(update.message || `Gerando: ${update.activity_title}`);
        setOverallProgress(update.progress || 0);
        setActivitiesProgress(prev => prev.map(a => 
          a.id === update.activity_id 
            ? { ...a, status: 'generating', progress: 10 }
            : a
        ));
        break;
      
      case 'field_generated':
        setActivitiesProgress(prev => prev.map(a => 
          a.id === update.activity_id 
            ? { 
                ...a, 
                progress: Math.min(a.progress + 15, 90),
                fieldsGenerated: [...a.fieldsGenerated, update.field_name || '']
              }
            : a
        ));
        break;
      
      case 'activity_completed':
        setOverallProgress(update.progress || 0);
        setActivitiesProgress(prev => prev.map(a => 
          a.id === update.activity_id 
            ? { ...a, status: 'completed', progress: 100 }
            : a
        ));
        break;
      
      case 'activity_error':
        setActivitiesProgress(prev => prev.map(a => 
          a.id === update.activity_id 
            ? { ...a, status: 'error', error: update.error }
            : a
        ));
        setHasError(true);
        break;
      
      case 'all_completed':
        setCurrentMessage(update.message || 'Geração concluída!');
        setOverallProgress(100);
        setGenerationComplete(true);
        break;
    }
  }, []);

  const startGeneration = async () => {
    if (isGenerating || !hasActivities) return;

    setIsGenerating(true);
    setHasError(false);
    setGenerationComplete(false);
    setCurrentMessage('Iniciando geração de conteúdo...');
    setOverallProgress(5);

    try {
      const result = await gerarConteudoAtividades({
        session_id: sessionId,
        conversation_context: conversationContext,
        user_objective: userObjective,
        on_progress: handleProgressUpdate
      });

      if (result.success) {
        markContentGenerationComplete();
        onComplete?.(result.data);
      } else {
        setHasError(true);
        onError?.(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      setHasError(true);
      onError?.(error instanceof Error ? error.message : 'Erro ao gerar conteúdo');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (autoStart && hasActivities && !isGenerating && !generationComplete) {
      const timer = setTimeout(() => startGeneration(), 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, hasActivities, isGenerating, generationComplete]);

  const getStatusIcon = (status: ActivityProgress['status']) => {
    switch (status) {
      case 'waiting':
        return <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600" />;
      case 'generating':
        return <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ActivityProgress['status']) => {
    switch (status) {
      case 'waiting': return 'bg-gray-100 dark:bg-gray-800';
      case 'generating': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'completed': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
  };

  if (!hasActivities) {
    return null;
  }

  return (
    <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900 dark:text-white">
                Geração de Conteúdo
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentMessage}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isGenerating && !generationComplete && (
              <Button
                onClick={startGeneration}
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
              >
                <Play className="w-4 h-4 mr-1" />
                Iniciar
              </Button>
            )}
            {hasError && !isGenerating && (
              <Button
                onClick={startGeneration}
                size="sm"
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Tentar Novamente
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Progresso Geral</span>
            <span className="font-medium text-purple-600 dark:text-purple-400">{overallProgress}%</span>
          </div>
          <Progress 
            value={overallProgress} 
            className="h-2 bg-purple-100 dark:bg-purple-900/30"
          />
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="pt-2 pb-4">
              <div className="space-y-2">
                {activitiesProgress.map((activity, idx) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-3 rounded-lg border ${getStatusColor(activity.status)} transition-all duration-300`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(activity.status)}
                        <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                          {activity.title}
                        </span>
                      </div>
                      {activity.status === 'generating' && (
                        <span className="text-xs text-orange-600 dark:text-orange-400">
                          {activity.progress}%
                        </span>
                      )}
                      {activity.status === 'completed' && (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {activity.fieldsGenerated.length} campos
                        </span>
                      )}
                    </div>
                    
                    {activity.status === 'generating' && (
                      <div className="mt-2">
                        <Progress 
                          value={activity.progress} 
                          className="h-1 bg-orange-100 dark:bg-orange-900/30"
                        />
                        {activity.fieldsGenerated.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {activity.fieldsGenerated.slice(-3).map((field, i) => (
                              <span 
                                key={i} 
                                className="text-xs px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded"
                              >
                                {field}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {activity.status === 'error' && activity.error && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {activity.error}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>

              {generationComplete && !hasError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Conteúdo gerado com sucesso!</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                    Os campos das atividades foram preenchidos automaticamente. 
                    Clique em cada atividade para revisar e ajustar o conteúdo.
                  </p>
                </motion.div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default ContentGenerationCard;

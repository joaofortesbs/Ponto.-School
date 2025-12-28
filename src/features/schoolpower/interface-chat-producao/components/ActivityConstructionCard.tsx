import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, Loader2, AlertCircle, Sparkles } from 'lucide-react';

interface ActivityBuildState {
  id: string;
  titulo: string;
  status: 'aguardando' | 'construindo' | 'concluida' | 'erro';
  progresso: number;
  erro?: string;
}

interface ConstructionState {
  status: 'aguardando' | 'construindo' | 'concluido';
  atividades: ActivityBuildState[];
}

interface ActivityConstructionCardProps {
  sessionId: string;
  atividades?: Array<{
    id: string;
    titulo: string;
    status?: string;
    progresso?: number;
  }>;
  onProgressUpdate?: (update: any) => void;
}

export function ActivityConstructionCard({ 
  sessionId, 
  atividades = [],
  onProgressUpdate 
}: ActivityConstructionCardProps) {
  const [constructionState, setConstructionState] = useState<ConstructionState>({
    status: 'aguardando',
    atividades: atividades.map(a => ({
      id: a.id,
      titulo: a.titulo,
      status: (a.status as ActivityBuildState['status']) || 'aguardando',
      progresso: a.progresso || 0
    }))
  });

  useEffect(() => {
    if (atividades.length > 0) {
      setConstructionState(prev => ({
        ...prev,
        atividades: atividades.map(a => ({
          id: a.id,
          titulo: a.titulo,
          status: (a.status as ActivityBuildState['status']) || 'aguardando',
          progresso: a.progresso || 0
        }))
      }));
    }
  }, [atividades]);

  const updateActivity = (update: any) => {
    if (update.type === 'construcao:iniciada') {
      setConstructionState({
        status: 'aguardando',
        atividades: update.atividades.map((a: any) => ({
          id: a.id,
          titulo: a.titulo,
          status: 'aguardando',
          progresso: 0
        }))
      });
    }

    if (update.type === 'atividade:construindo') {
      setConstructionState(prev => ({
        ...prev,
        status: 'construindo',
        atividades: prev.atividades.map((a, idx) =>
          idx === update.atividade_index
            ? { ...a, status: 'construindo', progresso: 0 }
            : a
        )
      }));
    }

    if (update.type === 'atividade:progresso') {
      setConstructionState(prev => ({
        ...prev,
        atividades: prev.atividades.map((a, idx) =>
          idx === update.atividade_index
            ? { ...a, progresso: update.progresso }
            : a
        )
      }));
    }

    if (update.type === 'atividade:concluida') {
      setConstructionState(prev => ({
        ...prev,
        atividades: prev.atividades.map((a, idx) =>
          idx === update.atividade_index
            ? { ...a, status: 'concluida', progresso: 100 }
            : a
        )
      }));
    }

    if (update.type === 'atividade:erro') {
      setConstructionState(prev => ({
        ...prev,
        atividades: prev.atividades.map((a, idx) =>
          idx === update.atividade_index
            ? { ...a, status: 'erro', erro: update.erro }
            : a
        )
      }));
    }

    if (update.type === 'construcao:concluida') {
      setConstructionState(prev => ({
        ...prev,
        status: 'concluido'
      }));
    }

    onProgressUpdate?.(update);
  };

  useEffect(() => {
    (window as any).updateActivityConstruction = updateActivity;
    return () => {
      delete (window as any).updateActivityConstruction;
    };
  }, []);

  const getStatusIcon = (status: ActivityBuildState['status']) => {
    switch (status) {
      case 'aguardando':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'construindo':
        return <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />;
      case 'concluida':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'erro':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ActivityBuildState['status']) => {
    switch (status) {
      case 'aguardando':
        return 'bg-gray-100 border-gray-200';
      case 'construindo':
        return 'bg-orange-50 border-orange-300';
      case 'concluida':
        return 'bg-emerald-50 border-emerald-300';
      case 'erro':
        return 'bg-red-50 border-red-300';
    }
  };

  const completedCount = constructionState.atividades.filter(a => a.status === 'concluida').length;
  const totalCount = constructionState.atividades.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
    >
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-white" />
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm">
            Construindo Atividades
          </h3>
          <p className="text-orange-100 text-xs">
            {completedCount}/{totalCount} atividades criadas
          </p>
        </div>
        {constructionState.status === 'concluido' && (
          <div className="bg-white/20 rounded-full px-3 py-1">
            <span className="text-white text-xs font-medium">Concluído!</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <AnimatePresence>
          {constructionState.atividades.map((atividade, idx) => (
            <motion.div
              key={atividade.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`
                p-3 rounded-lg border-2 transition-all duration-300
                ${getStatusColor(atividade.status)}
              `}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(atividade.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {atividade.titulo}
                  </p>
                  {atividade.status === 'construindo' && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-orange-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${atividade.progresso}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {atividade.progresso}% concluído
                      </p>
                    </div>
                  )}
                  {atividade.status === 'erro' && atividade.erro && (
                    <p className="text-xs text-red-600 mt-1">
                      Erro: {atividade.erro}
                    </p>
                  )}
                </div>
                {atividade.status === 'concluida' && (
                  <span className="text-xs text-emerald-600 font-medium">
                    Pronta!
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {constructionState.status === 'concluido' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 pb-4"
        >
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <p className="text-sm text-emerald-700 font-medium">
              Todas as atividades foram criadas com sucesso!
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              Você pode encontrá-las no seu painel de atividades.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default ActivityConstructionCard;

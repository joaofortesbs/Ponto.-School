import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, CheckCircle, Circle, Loader2, Clock, Check, AlertCircle } from 'lucide-react';
import { useChatState } from '../state/chatState';
import type { DevModeCardData, CapabilityState } from '../types/message-types';

interface DeveloperModeCardProps {
  cardId: string;
  data: DevModeCardData;
  isStatic?: boolean;
}

export function DeveloperModeCard({ cardId, data, isStatic = true }: DeveloperModeCardProps) {
  const { updateCardData, updateCapabilityStatus, updateEtapaStatus, addTextMessage, addCapabilityToEtapa } = useChatState();

  useEffect(() => {
    const handleProgress = (event: CustomEvent) => {
      const update = event.detail;

      if (update.type === 'capability:apareceu') {
        const novaCapability: CapabilityState = {
          id: `cap-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          nome: update.capability_name,
          displayName: update.displayName,
          status: 'pendente'
        };
        addCapabilityToEtapa(cardId, update.stepIndex, novaCapability);
      }

      if (update.type === 'capability:iniciou') {
        updateCapabilityStatus(cardId, update.stepIndex, update.capability_id, 'executando');
      }

      if (update.type === 'capability:concluiu') {
        updateCapabilityStatus(cardId, update.stepIndex, update.capability_id, 'concluido');
        if (update.mensagem) {
          addTextMessage('assistant', update.mensagem);
        }
      }

      if (update.type === 'execution:step:started') {
        updateEtapaStatus(cardId, update.stepIndex, 'executando');
      }

      if (update.type === 'execution:step:completed') {
        updateEtapaStatus(cardId, update.stepIndex, 'concluido');
        addTextMessage('assistant', `Etapa "${update.stepTitle}" concluída com sucesso!`);
      }

      if (update.type === 'execution:completed') {
        updateCardData(cardId, { status: 'concluido' });
      }
    };

    window.addEventListener('agente-jota-progress', handleProgress as EventListener);

    return () => {
      window.removeEventListener('agente-jota-progress', handleProgress as EventListener);
    };
  }, [cardId, updateCardData, updateCapabilityStatus, updateEtapaStatus, addTextMessage, addCapabilityToEtapa]);

  if (!data) return null;

  const getStatusBadge = () => {
    switch (data.status) {
      case 'executando':
        return (
          <span className="flex items-center gap-1.5 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-medium">
            <Loader2 className="w-3 h-3 animate-spin" />
            Em execução
          </span>
        );
      case 'concluido':
        return (
          <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Concluído
          </span>
        );
      case 'erro':
        return (
          <span className="flex items-center gap-1.5 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Erro
          </span>
        );
    }
  };

  const getEtapaIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'executando':
        return <Circle className="w-5 h-5 text-orange-500 animate-pulse" />;
      default:
        return <Circle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCapabilityIcon = (status: CapabilityState['status']) => {
    switch (status) {
      case 'executando':
        return <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />;
      case 'concluido':
        return <Check className="w-3.5 h-3.5 text-emerald-400" />;
      case 'erro':
        return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  return (
    <motion.div
      layout={isStatic}
      className="w-full max-w-2xl mx-auto my-2"
    >
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-orange-500/30 rounded-xl overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-orange-400" />
            </div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
              Modo Desenvolvedor
            </h3>
          </div>
          {getStatusBadge()}
        </div>

        <div className="p-5 space-y-4">
          <AnimatePresence mode="sync">
            {data.etapas.map((etapa, idx) => (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`
                  p-4 rounded-lg border transition-all duration-300
                  ${etapa.status === 'concluido' 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : etapa.status === 'executando'
                    ? 'bg-orange-500/10 border-orange-500/30'
                    : 'bg-gray-700/30 border-gray-600/30'}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getEtapaIcon(etapa.status)}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${
                      etapa.status === 'concluido' 
                        ? 'text-emerald-300' 
                        : etapa.status === 'executando'
                        ? 'text-orange-300'
                        : 'text-gray-300'
                    }`}>
                      {etapa.titulo}
                    </p>

                    {etapa.status === 'executando' && etapa.capabilities.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-3 pl-2 border-l-2 border-orange-500/30 space-y-2"
                      >
                        {etapa.capabilities.map((cap) => (
                          <div 
                            key={cap.id} 
                            className="flex items-center gap-2 text-xs"
                          >
                            {getCapabilityIcon(cap.status)}
                            <span className={`
                              ${cap.status === 'concluido' ? 'text-emerald-300' : 
                                cap.status === 'executando' ? 'text-orange-300' : 
                                'text-gray-400'}
                            `}>
                              {cap.displayName || cap.nome}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {etapa.status === 'concluido' && (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-400">
                        <Check size={12} />
                        Concluído
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default DeveloperModeCard;

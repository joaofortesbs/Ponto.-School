import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, ChevronRight, AlertCircle } from 'lucide-react';

export type CapabilityStatus = 'hidden' | 'pending' | 'executing' | 'completed' | 'error';
export type ObjectiveStatus = 'pending' | 'active' | 'completed';

export interface CapabilityItem {
  id: string;
  nome: string;
  displayName?: string;
  status: CapabilityStatus;
}

export interface ObjectiveItem {
  ordem: number;
  titulo: string;
  descricao?: string;
  status: ObjectiveStatus;
  capabilities: CapabilityItem[];
}

interface ProgressiveExecutionCardProps {
  objectives: ObjectiveItem[];
  onObjectiveComplete?: (index: number) => void;
  onAllComplete?: () => void;
}

const ObjectiveCard: React.FC<{
  objective: ObjectiveItem;
  index: number;
  isVisible: boolean;
}> = ({ objective, index, isVisible }) => {
  if (!isVisible) return null;

  const isCompleted = objective.status === 'completed';
  const isActive = objective.status === 'active';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.1 
      }}
      className="flex flex-col gap-3"
    >
      <div
        className={`
          relative flex items-center gap-4 px-5 py-4 rounded-full
          transition-all duration-500 ease-out
          ${isCompleted 
            ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' 
            : 'bg-[#FF6B35] shadow-lg shadow-[#FF6B35]/30'}
        `}
        style={{
          minHeight: '56px',
        }}
      >
        <motion.div
          className={`
            flex items-center justify-center w-7 h-7 rounded-full
            border-2 transition-all duration-300
            ${isCompleted 
              ? 'bg-white border-white' 
              : 'bg-transparent border-white/70'}
          `}
          animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {isCompleted ? (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.3, ease: 'backOut' }}
              >
                <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
              </motion.div>
            ) : isActive ? (
              <motion.div
                key="active"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-3 h-3 rounded-full bg-white"
              />
            ) : null}
          </AnimatePresence>
        </motion.div>

        <span className="flex-1 text-white font-semibold text-sm md:text-base text-center pr-8">
          {objective.titulo}
        </span>

        <motion.div
          animate={isActive ? { x: [0, 4, 0] } : {}}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-4"
        >
          <ChevronRight className="w-5 h-5 text-white/80" />
        </motion.div>
      </div>

      <AnimatePresence mode="sync">
        {objective.capabilities
          .filter(cap => cap.status !== 'hidden')
          .map((capability, capIndex) => (
            <CapabilityCard 
              key={capability.id} 
              capability={capability}
              index={capIndex}
            />
          ))}
      </AnimatePresence>
    </motion.div>
  );
};

const CapabilityCard: React.FC<{
  capability: CapabilityItem;
  index: number;
}> = ({ capability, index }) => {
  const isPending = capability.status === 'pending';
  const isExecuting = capability.status === 'executing';
  const isCompleted = capability.status === 'completed';
  const isError = capability.status === 'error';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ 
        duration: 0.35, 
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className="ml-8 overflow-hidden"
    >
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-full
          border-2 border-dashed transition-all duration-300
          ${isCompleted 
            ? 'border-emerald-400/60 bg-emerald-500/10' 
            : isError
            ? 'border-red-400/60 bg-red-500/10'
            : isExecuting
            ? 'border-[#FF6B35]/60 bg-[#FF6B35]/10'
            : isPending
            ? 'border-gray-500/40 bg-gray-500/5'
            : 'border-[#FF6B35]/40 bg-[#FF6B35]/5'}
        `}
      >
        <div className="flex items-center justify-center w-6 h-6">
          <AnimatePresence mode="wait">
            {isPending && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="w-4 h-4 rounded-full border-2 border-gray-500/50"
              />
            )}
            {isExecuting && (
              <motion.div
                key="spinner"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                <Loader2 className="w-4 h-4 text-[#FF6B35] animate-spin" />
              </motion.div>
            )}
            {isCompleted && (
              <motion.div
                key="check"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              </motion.div>
            )}
            {isError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <AlertCircle className="w-4 h-4 text-red-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span
          className={`
            flex-1 text-sm font-medium transition-colors duration-300
            ${isCompleted 
              ? 'text-emerald-300' 
              : isError
              ? 'text-red-300'
              : isExecuting
              ? 'text-[#FF6B35]'
              : 'text-gray-500'}
          `}
        >
          {capability.displayName || capability.nome}
        </span>

        {isExecuting && (
          <motion.div
            className="flex gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export function ProgressiveExecutionCard({
  objectives: initialObjectives,
  onObjectiveComplete,
  onAllComplete,
}: ProgressiveExecutionCardProps) {
  const [objectives, setObjectives] = useState<ObjectiveItem[]>(
    initialObjectives.map((obj, idx) => ({
      ...obj,
      status: idx === 0 ? 'active' : obj.status,
      capabilities: obj.capabilities.map(cap => ({ 
        ...cap, 
        status: cap.status === 'hidden' ? 'pending' : cap.status 
      })),
    }))
  );
  const [visibleObjectives, setVisibleObjectives] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    setObjectives(
      initialObjectives.map((obj, idx) => ({
        ...obj,
        status: idx === 0 ? 'active' : (obj.status === 'completed' ? 'completed' : obj.status),
        capabilities: obj.capabilities.map(cap => ({ 
          ...cap, 
          status: cap.status === 'hidden' ? 'pending' : cap.status 
        })),
      }))
    );
    setVisibleObjectives(new Set([0]));
  }, [initialObjectives]);

  const handleProgressEvent = useCallback((event: CustomEvent) => {
    const update = event.detail;

    if (update.type === 'execution:step:started') {
      const stepIndex = update.stepIndex ?? 0;
      setVisibleObjectives(prev => new Set([...prev, stepIndex]));
      setObjectives(prev => prev.map((obj, idx) => 
        idx === stepIndex ? { ...obj, status: 'active' } : obj
      ));
    }

    if (update.type === 'capability:apareceu' || update.type === 'capability:iniciou') {
      const stepIndex = update.stepIndex ?? 0;
      const capabilityId = update.capability_id;
      const capabilityName = update.capability_name || update.displayName;

      setObjectives(prev => prev.map((obj, idx) => {
        if (idx !== stepIndex) return obj;

        const existingCap = obj.capabilities.find(c => c.id === capabilityId);
        if (existingCap) {
          return {
            ...obj,
            capabilities: obj.capabilities.map(cap =>
              cap.id === capabilityId
                ? { ...cap, status: 'executing' as CapabilityStatus }
                : cap
            ),
          };
        }

        const newCapability: CapabilityItem = {
          id: capabilityId || `cap-${Date.now()}`,
          nome: capabilityName || 'Processando...',
          displayName: update.displayName || capabilityName,
          status: 'executing',
        };

        return {
          ...obj,
          capabilities: [...obj.capabilities, newCapability],
        };
      }));
    }

    if (update.type === 'capability:concluiu') {
      const stepIndex = update.stepIndex ?? 0;
      const capabilityId = update.capability_id;

      setObjectives(prev => prev.map((obj, idx) => {
        if (idx !== stepIndex) return obj;
        return {
          ...obj,
          capabilities: obj.capabilities.map(cap =>
            cap.id === capabilityId
              ? { ...cap, status: 'completed' as CapabilityStatus }
              : cap
          ),
        };
      }));
    }

    if (update.type === 'execution:step:completed') {
      const stepIndex = update.stepIndex ?? 0;
      
      setObjectives(prev => {
        const updated = prev.map((obj, idx) =>
          idx === stepIndex ? { ...obj, status: 'completed' as ObjectiveStatus } : obj
        );

        const nextIndex = stepIndex + 1;
        if (nextIndex < updated.length) {
          setVisibleObjectives(prevVisible => new Set([...prevVisible, nextIndex]));
          updated[nextIndex] = { ...updated[nextIndex], status: 'active' };
        }

        return updated;
      });

      onObjectiveComplete?.(stepIndex);
    }

    if (update.type === 'execution:completed') {
      setObjectives(prev => prev.map(obj => ({ 
        ...obj, 
        status: 'completed' as ObjectiveStatus 
      })));
      onAllComplete?.();
    }
  }, [onObjectiveComplete, onAllComplete]);

  useEffect(() => {
    window.addEventListener('agente-jota-progress', handleProgressEvent as EventListener);
    return () => {
      window.removeEventListener('agente-jota-progress', handleProgressEvent as EventListener);
    };
  }, [handleProgressEvent]);

  return (
    <div className="w-full space-y-4">
      <AnimatePresence mode="sync">
        {objectives.map((objective, idx) => (
          <ObjectiveCard
            key={`objective-${idx}`}
            objective={objective}
            index={idx}
            isVisible={visibleObjectives.has(idx)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ProgressiveExecutionCard;

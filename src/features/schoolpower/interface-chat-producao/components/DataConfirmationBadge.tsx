/**
 * DATA CONFIRMATION BADGE
 * 
 * Badge visual para mostrar o status da confirmação de dados de uma capability.
 * Exibe checks individuais e indica se a próxima etapa está bloqueada.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX,
  ChevronDown,
  ChevronUp,
  Check,
  X
} from 'lucide-react';
import type { DataConfirmation, DataCheck } from '../../agente-jota/capabilities/shared/types';

interface DataConfirmationBadgeProps {
  confirmation: DataConfirmation;
  capabilityName?: string;
  compact?: boolean;
  showDetails?: boolean;
}

const CheckItem: React.FC<{ check: DataCheck }> = ({ check }) => {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
      check.passed 
        ? 'bg-emerald-500/10 text-emerald-400' 
        : 'bg-red-500/10 text-red-400'
    }`}>
      {check.passed ? (
        <Check className="w-3 h-3" />
      ) : (
        <X className="w-3 h-3" />
      )}
      <span className="flex-1">{check.label}</span>
      {check.value !== undefined && (
        <span className="font-mono text-[10px] opacity-70">
          {typeof check.value === 'boolean' ? (check.value ? 'sim' : 'não') : check.value}
        </span>
      )}
    </div>
  );
};

export function DataConfirmationBadge({ 
  confirmation, 
  capabilityName,
  compact = false,
  showDetails = true
}: DataConfirmationBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const passedCount = confirmation.checks.filter(c => c.passed).length;
  const totalCount = confirmation.checks.length;
  const allPassed = confirmation.confirmed;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
        allPassed 
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
          : 'bg-red-500/20 text-red-400 border border-red-500/30'
      }`}>
        {allPassed ? (
          <ShieldCheck className="w-3 h-3" />
        ) : (
          <ShieldAlert className="w-3 h-3" />
        )}
        <span>{passedCount}/{totalCount}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border overflow-hidden ${
        allPassed 
          ? 'bg-emerald-500/5 border-emerald-500/20' 
          : confirmation.blocksNextStep
            ? 'bg-red-500/5 border-red-500/20'
            : 'bg-yellow-500/5 border-yellow-500/20'
      }`}
    >
      <button
        onClick={() => showDetails && setIsExpanded(!isExpanded)}
        className={`w-full flex items-center gap-3 px-4 py-3 ${showDetails ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'}`}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          allPassed 
            ? 'bg-emerald-500/20' 
            : confirmation.blocksNextStep 
              ? 'bg-red-500/20' 
              : 'bg-yellow-500/20'
        }`}>
          {allPassed ? (
            <ShieldCheck className={`w-4 h-4 ${allPassed ? 'text-emerald-400' : 'text-red-400'}`} />
          ) : confirmation.blocksNextStep ? (
            <ShieldX className="w-4 h-4 text-red-400" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-yellow-400" />
          )}
        </div>

        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${
              allPassed ? 'text-emerald-400' : confirmation.blocksNextStep ? 'text-red-400' : 'text-yellow-400'
            }`}>
              Confirmação de Dados
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              allPassed 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {passedCount}/{totalCount} checks
            </span>
          </div>
          <p className="text-xs text-white/50 mt-0.5">
            {capabilityName && <span className="font-mono mr-1">[{capabilityName}]</span>}
            {confirmation.summary}
          </p>
        </div>

        {showDetails && (
          <div className="text-white/40">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        )}
      </button>

      <AnimatePresence>
        {isExpanded && showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-1.5 border-t border-white/5 pt-3">
              {confirmation.checks.map((check) => (
                <CheckItem key={check.id} check={check} />
              ))}
              
              {confirmation.blocksNextStep && !confirmation.confirmed && (
                <div className="mt-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400">
                    <ShieldX className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      Próxima etapa BLOQUEADA até dados serem confirmados
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default DataConfirmationBadge;

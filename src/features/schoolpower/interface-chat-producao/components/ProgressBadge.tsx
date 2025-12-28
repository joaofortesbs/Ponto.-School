import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronUp } from 'lucide-react';
import { useChatState } from '../state/chatState';
import type { DevModeCardData } from '../types/message-types';

export function ProgressBadge() {
  const devModeCard = useChatState((state) => state.getDevModeCard());
  const isExecuting = useChatState((state) => state.isExecuting);

  if (!devModeCard?.metadata?.cardData || !isExecuting) return null;

  const data = devModeCard.metadata.cardData as DevModeCardData;
  const etapaAtual = data.etapaAtual || 0;
  const totalEtapas = data.etapas?.length || 0;
  const etapaAtualData = data.etapas?.[etapaAtual];

  if (data.status !== 'executando') return null;

  const currentCapability = etapaAtualData?.capabilities?.find(
    c => c.status === 'executando'
  ) || etapaAtualData?.capabilities?.[0];

  const displayText = currentCapability?.displayName || 
                       currentCapability?.nome || 
                       etapaAtualData?.titulo ||
                       'Processando...';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 backdrop-blur-lg px-5 py-3 rounded-full shadow-lg shadow-orange-500/30">
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
          
          <p className="text-white text-sm font-medium max-w-[200px] truncate">
            {displayText}
          </p>

          <div className="bg-white/20 rounded-full px-2.5 py-0.5">
            <span className="text-white text-xs font-semibold">
              {etapaAtual + 1} / {totalEtapas}
            </span>
          </div>

          <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <ChevronUp className="w-4 h-4 text-white" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ProgressBadge;

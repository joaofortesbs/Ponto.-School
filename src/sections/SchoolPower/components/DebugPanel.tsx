"use client";
import React, { useState } from 'react';
import useSchoolPowerFlow from '../../../features/schoolpower/hooks/useSchoolPowerFlow';

export default function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const { flowState, flowData } = useSchoolPowerFlow();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-500 text-white px-3 py-2 rounded text-xs"
      >
        Debug
      </button>

      {isVisible && (
        <div className="absolute top-full right-0 mt-2 bg-black text-white p-4 rounded max-w-sm text-xs">
          <h3 className="font-bold mb-2">School Power Debug</h3>
          <p><strong>Estado:</strong> {flowState}</p>
          <p><strong>Mensagem:</strong> {flowData.initialMessage ? 'Sim' : 'Não'}</p>
          <p><strong>Contextualização:</strong> {flowData.contextualizationData ? 'Sim' : 'Não'}</p>
          <p><strong>Action Plan:</strong> {flowData.actionPlan?.length || 0} itens</p>
        </div>
      )}
    </div>
  );
}
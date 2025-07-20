
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ChevronLeft, Sparkles, AlertCircle } from 'lucide-react';

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  approved: boolean;
}

interface ActionPlanCardProps {
  actionPlan: ActionPlanItem[];
  onApprove: (approvedItems: ActionPlanItem[]) => void;
  isLoading?: boolean;
}

export function ActionPlanCard({ actionPlan, onApprove, isLoading = false }: ActionPlanCardProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Log detalhado dos props recebidos
  useEffect(() => {
    console.log('🎯 ActionPlanCard: Props recebidos');
    console.log('📊 Action Plan recebido:', actionPlan);
    console.log('📊 Número de atividades:', actionPlan?.length || 0);
    console.log('📊 Is Loading:', isLoading);
    console.log('📋 Estrutura das atividades:', actionPlan?.map((item, index) => ({
      index,
      id: item.id,
      hasTitle: !!item.title,
      hasDescription: !!item.description,
      titleLength: item.title?.length || 0,
      descriptionLength: item.description?.length || 0,
      approved: item.approved
    })));
  }, [actionPlan, isLoading]);

  // Validar estrutura dos dados recebidos
  useEffect(() => {
    if (actionPlan && actionPlan.length > 0) {
      console.log('🔍 Validando estrutura dos dados do Action Plan...');
      
      const validationResults = actionPlan.map((item, index) => {
        const validation = {
          index,
          id: item.id,
          hasValidId: !!item.id && typeof item.id === 'string',
          hasValidTitle: !!item.title && typeof item.title === 'string',
          hasValidDescription: !!item.description && typeof item.description === 'string',
          hasValidApproved: typeof item.approved === 'boolean'
        };
        
        const isValid = validation.hasValidId && validation.hasValidTitle && validation.hasValidDescription && validation.hasValidApproved;
        
        if (!isValid) {
          console.warn(`⚠️ Atividade ${index + 1} tem estrutura inválida:`, validation);
        }
        
        return { ...validation, isValid };
      });
      
      const validCount = validationResults.filter(v => v.isValid).length;
      const invalidCount = validationResults.length - validCount;
      
      console.log(`✅ Validação concluída: ${validCount} válidas, ${invalidCount} inválidas`);
      
      if (invalidCount > 0) {
        console.error('❌ Atividades com estrutura inválida encontradas:', 
          validationResults.filter(v => !v.isValid)
        );
      }
    }
  }, [actionPlan]);

  const handleItemToggle = (itemId: string) => {
    console.log(`🔄 Toggling atividade: ${itemId}`);
    
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
      console.log(`➖ Atividade ${itemId} desmarcada`);
    } else {
      newSelected.add(itemId);
      console.log(`➕ Atividade ${itemId} marcada`);
    }
    
    setSelectedItems(newSelected);
    console.log('📊 Atividades selecionadas atualizadas:', Array.from(newSelected));
  };

  const handleApprove = () => {
    console.log('✅ Iniciando processo de aprovação...');
    console.log('📊 Atividades selecionadas:', Array.from(selectedItems));
    
    const approvedItems = actionPlan
      .filter(item => selectedItems.has(item.id))
      .map(item => ({ ...item, approved: true }));

    console.log('📋 Atividades aprovadas para geração:', approvedItems);
    console.log('📊 Detalhes das atividades aprovadas:', approvedItems.map(item => ({
      id: item.id,
      title: item.title.substring(0, 50) + '...',
      approved: item.approved
    })));

    if (approvedItems.length > 0) {
      console.log(`🚀 Enviando ${approvedItems.length} atividades para geração`);
      onApprove(approvedItems);
    } else {
      console.warn('⚠️ Nenhuma atividade selecionada para aprovação');
    }
  };

  const handleBack = () => {
    console.log('🔙 Usuário clicou em voltar');
    // Implementar lógica de voltar se necessário
    window.location.reload();
  };

  // Renderização do estado de loading
  if (isLoading) {
    console.log('⏳ Renderizando estado de loading...');
    return (
      <motion.div 
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-2xl border border-white/30"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FF6B00]/20 border-t-[#FF6B00] mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            🤖 Gerando Plano de Ação
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            A IA está criando atividades personalizadas para você...
          </p>
        </div>
      </motion.div>
    );
  }

  // Verificar se há atividades para renderizar
  const hasValidActivities = actionPlan && Array.isArray(actionPlan) && actionPlan.length > 0;
  console.log('🔍 Verificação de atividades válidas:', hasValidActivities);

  return (
    <motion.div 
      className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-2xl border border-white/30"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#FF6B00]" />
            Plano de Ação Personalizado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Selecione as atividades que deseja gerar
          </p>
        </div>

        <div className="w-20"></div>
      </div>

      {/* Lista de Atividades */}
      <div className="space-y-4 mb-8">
        {!hasValidActivities ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {actionPlan === null || actionPlan === undefined 
                ? 'Nenhuma atividade disponível' 
                : 'Erro na estrutura das atividades'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {actionPlan === null || actionPlan === undefined
                ? 'Houve um problema ao gerar as atividades. Tente novamente.'
                : 'As atividades não possuem a estrutura correta. Verifique os logs para mais detalhes.'}
            </p>
            {/* Debug info */}
            <div className="text-xs text-gray-500 mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p><strong>Debug Info:</strong></p>
              <p>Action Plan Type: {typeof actionPlan}</p>
              <p>Is Array: {Array.isArray(actionPlan) ? 'Yes' : 'No'}</p>
              <p>Length: {actionPlan?.length || 'N/A'}</p>
              <p>Raw Data: {JSON.stringify(actionPlan)?.substring(0, 100)}...</p>
            </div>
          </div>
        ) : (
          actionPlan.map((item, index) => {
            // Validação individual de cada item
            const isValidItem = item && item.id && item.title && item.description;
            
            if (!isValidItem) {
              console.warn(`⚠️ Item ${index} inválido:`, item);
              return (
                <div key={`invalid-${index}`} className="p-4 border-2 border-red-200 rounded-xl bg-red-50">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span>Atividade {index + 1}: Dados inválidos</span>
                  </div>
                  <pre className="text-xs mt-2 text-red-500">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </div>
              );
            }

            return (
              <motion.div
                key={item.id}
                className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  selectedItems.has(item.id)
                    ? 'border-[#FF6B00] bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10'
                    : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-[#FF6B00]/50'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => handleItemToggle(item.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                    selectedItems.has(item.id)
                      ? 'border-[#FF6B00] bg-[#FF6B00]'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedItems.has(item.id) && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                    
                    {/* Debug badge - remover em produção */}
                    <div className="mt-2 text-xs text-gray-500">
                      ID: {item.id}
                    </div>
                  </div>

                  {/* Indicador de seleção */}
                  {selectedItems.has(item.id) && (
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-[#FF6B00] rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer com estatísticas e ações */}
      {hasValidActivities && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedItems.size} de {actionPlan.length} atividades selecionadas
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={handleApprove}
              disabled={selectedItems.size === 0}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                selectedItems.size > 0
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-white hover:shadow-lg hover:scale-105'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Gerar Atividades ({selectedItems.size})
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default ActionPlanCard;

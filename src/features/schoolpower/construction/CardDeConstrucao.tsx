
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, CheckCircle2, AlertCircle, Loader2, Wand2, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import ContextualizationCard, { ContextualizationData } from '../contextualization/ContextualizationCard';
import ActionPlanCard, { ActionPlanItem } from '../actionplan/ActionPlanCard';
import ConstructionGrid from './ConstructionGrid';
import { generatePersonalizedPlan } from '../services/generatePersonalizedPlan';
import useSchoolPowerFlow from '../hooks/useSchoolPowerFlow';

interface CardDeConstrucaoProps {
  flowData: {
    initialMessage: string | null;
    contextualizationData: ContextualizationData | null;
    actionPlan: ActionPlanItem[] | null;
    manualActivities?: ActionPlanItem[] | null;
  };
  onBack?: () => void;
  step: 'contextualization' | 'actionPlan' | 'generating' | 'generatingActivities' | 'activities';
}

function CardDeConstrucao({ flowData, onBack, step }: CardDeConstrucaoProps) {
  console.log('👁️ Componentes padrão visíveis:', false);
  console.log('🏗️ Estado atual do fluxo:', step);
  console.log('🎯 ActionPlan recebido no CardDeConstrucao:', flowData?.actionPlan);

  const {
    submitContextualization,
    approveActionPlan,
    isLoading
  } = useSchoolPowerFlow();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estado para controlar a regeneração de atividades
  const [shouldRegenerateActivities, setShouldRegenerateActivities] = useState(false);

  // Validar dados de contextualização
  const validateContextualizationData = (data: ContextualizationData): boolean => {
    if (!data) return false;
    
    const isValidField = (field: string) => {
      return field && 
             field.trim() !== '' && 
             field.trim() !== '73' && 
             field.length > 2 &&
             !field.includes('Based on:') &&
             field !== 'undefined';
    };
    
    return isValidField(data.materias) && isValidField(data.publicoAlvo);
  };

  // Verificar se dados são válidos apenas uma vez
  useEffect(() => {
    console.log('🔍 Verificando validade dos dados de contextualização...');
    
    if (flowData?.contextualizationData && step === 'contextualization') {
      const isDataValid = validateContextualizationData(flowData.contextualizationData);
      
      if (!isDataValid) {
        console.warn('⚠️ Dados de contextualização inválidos detectados');
        setErrorMessage('Dados de contextualização precisam ser corrigidos.');
      }
    }
  }, [flowData?.contextualizationData, step]);

  

  // Função para lidar com submissão de contextualização
  const handleContextualizationSubmit = async (data: ContextualizationData) => {
    console.log('📝 Submetendo contextualização:', data);
    
    // Validar dados antes de submeter
    if (!validateContextualizationData(data)) {
      console.error('❌ Dados inválidos fornecidos');
      setErrorMessage('Por favor, preencha todos os campos com informações válidas.');
      return;
    }

    try {
      await submitContextualization(data);
      setErrorMessage(null);
    } catch (error) {
      console.error('❌ Erro ao submeter contextualização:', error);
      setErrorMessage('Erro ao processar contextualização. Tente novamente.');
    }
  };

  // Função para aprovar plano de ação
  const handleActionPlanApproval = async (approvedItems: ActionPlanItem[]) => {
    console.log('✅ Aprovando plano de ação:', approvedItems);
    
    if (!approvedItems || approvedItems.length === 0) {
      setErrorMessage('Selecione pelo menos uma atividade para continuar.');
      return;
    }

    try {
      await approveActionPlan(approvedItems);
      setErrorMessage(null);
    } catch (error) {
      console.error('❌ Erro ao aprovar plano:', error);
      setErrorMessage('Erro ao aprovar atividades. Tente novamente.');
    }
  };

  // Renderizar estado de carregamento/geração
  const renderLoadingState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 space-y-6"
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
        />
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-white">
          {step === 'generating' ? 'Gerando Plano Personalizado...' : 
           step === 'generatingActivities' ? 'Preparando Atividades...' : 
           'Processando...'}
        </h3>
        <p className="text-gray-300">
          {isGenerating ? 'Regenerando atividades com dados corretos' : 
           'Aguarde enquanto preparamos suas atividades personalizadas'}
        </p>
        
        {(isGenerating && generationProgress > 0) && (
          <div className="w-full max-w-sm mx-auto">
            <Progress value={generationProgress} className="h-2" />
            <p className="text-sm text-gray-400 mt-1">{generationProgress}%</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  // Renderizar mensagens de erro
  const renderErrorMessage = () => {
    if (!errorMessage) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4"
      >
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-red-300">{errorMessage}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <div className="flex items-center space-x-2">
              <Wand2 className="h-6 w-6 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">School Power</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-400" />
            <Badge variant="outline" className="border-purple-500/30 text-purple-300">
              IA Personalizada
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="container mx-auto px-6 py-8 max-w-6xl">
              {renderErrorMessage()}
              
              <AnimatePresence mode="wait">
                {/* Contextualização */}
                {step === 'contextualization' && (
                  <motion.div
                    key="contextualization"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <ContextualizationCard
                      initialMessage={flowData?.initialMessage || ''}
                      onSubmit={handleContextualizationSubmit}
                      isLoading={isLoading || isGenerating}
                    />
                  </motion.div>
                )}

                {/* Estados de Carregamento */}
                {(step === 'generating' || step === 'generatingActivities' || isGenerating) && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className="bg-slate-800/50 border-slate-700/50">
                      <CardContent className="p-8">
                        {renderLoadingState()}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Plano de Ação */}
                {step === 'actionPlan' && flowData?.actionPlan && !isGenerating && (
                  <motion.div
                    key="actionplan"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <ActionPlanCard
                      actionPlan={flowData.actionPlan}
                      onApprove={handleActionPlanApproval}
                      isLoading={isLoading}
                      contextualizationData={flowData.contextualizationData}
                    />
                  </motion.div>
                )}

                {/* Atividades Aprovadas */}
                {step === 'activities' && flowData?.actionPlan && !isGenerating && (
                  <motion.div
                    key="activities"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ConstructionGrid
                      activities={flowData.actionPlan.filter(item => item.approved)}
                      contextualizationData={flowData.contextualizationData}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardDeConstrucao;
export { CardDeConstrucao };

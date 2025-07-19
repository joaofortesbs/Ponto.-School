
import { useState, useCallback } from 'react';
import { ContextualizationData } from '../contextualization/ContextualizationCard';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';

export type FlowState = 'idle' | 'contextualizing' | 'actionplan' | 'generating' | 'generatingActivities';

interface SchoolPowerFlowData {
  initialMessage: string | null;
  contextualizationData: ContextualizationData | null;
  actionPlan: ActionPlanItem[] | null;
  timestamp: number;
}

interface UseSchoolPowerFlowReturn {
  flowState: FlowState;
  flowData: SchoolPowerFlowData;
  sendInitialMessage: (message: string) => void;
  submitContextualization: (data: ContextualizationData) => void;
  approveActionPlan: (approvedItems: ActionPlanItem[]) => void;
  resetFlow: () => void;
  isLoading: boolean;
}

const STORAGE_KEY = 'schoolpower_flow_data';
const GEMINI_API_KEY = 'AIzaSyD-Sso0SdyYKoA4M3tQhcWjQ1AoddB7Wo4';

export function useSchoolPowerFlow(): UseSchoolPowerFlowReturn {
  // Carrega dados salvos do localStorage
  const loadStoredData = (): SchoolPowerFlowData => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // Verifica se os dados não são muito antigos (1 hora)
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - data.timestamp < oneHour) {
          return data;
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do School Power Flow:', error);
    }
    
    return {
      initialMessage: null,
      contextualizationData: null,
      actionPlan: null,
      timestamp: Date.now()
    };
  };

  const [flowData, setFlowData] = useState<SchoolPowerFlowData>(loadStoredData);
  const [flowState, setFlowState] = useState<FlowState>(() => {
    const stored = loadStoredData();
    if (stored.initialMessage && !stored.contextualizationData) {
      return 'contextualizing';
    }
    if (stored.initialMessage && stored.contextualizationData && !stored.actionPlan) {
      return 'actionplan';
    }
    if (stored.initialMessage && stored.contextualizationData && stored.actionPlan) {
      return 'generating';
    }
    return 'idle';
  });
  const [isLoading, setIsLoading] = useState(false);

  // Salva dados no localStorage
  const saveData = useCallback((data: SchoolPowerFlowData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('💾 Dados do School Power Flow salvos:', data);
    } catch (error) {
      console.error('❌ Erro ao salvar dados do School Power Flow:', error);
    }
  }, []);

  // Envia mensagem inicial e inicia processo de contextualização
  const sendInitialMessage = useCallback((message: string) => {
    console.log('📤 Mensagem inicial enviada:', message);
    
    const newData: SchoolPowerFlowData = {
      initialMessage: message,
      contextualizationData: null,
      actionPlan: null,
      timestamp: Date.now()
    };
    
    setFlowData(newData);
    saveData(newData);
    setFlowState('contextualizing');
  }, [saveData]);

  // Função para gerar action plan com API Gemini
  const generateActionPlan = useCallback(async (message: string, contextData: ContextualizationData): Promise<ActionPlanItem[]> => {
    try {
      console.log('🤖 Iniciando geração de plano de ação com IA Gemini...');
      console.log('📝 ANÁLISE COMPLETA - Mensagem inicial:', message);
      console.log('📝 ANÁLISE COMPLETA - Dados de contextualização:', contextData);

      // Importar lista de atividades disponíveis
      const activitiesModule = await import('../data/schoolPowerActivities.json');
      const schoolPowerActivities = activitiesModule.default;

      // Preparar lista completa de atividades para análise
      const activitiesAnalysisText = schoolPowerActivities
        .filter(activity => activity.enabled)
        .map(activity => 
          `ID: ${activity.id}
TÍTULO: ${activity.title}
DESCRIÇÃO: ${activity.description}
TAGS: ${activity.tags.join(', ')}
API: ${activity.apiType}
---`
        ).join('\n');

      // Construir prompt ultra-detalhado para análise completa
      const prompt = `Você é uma IA especializada do School Power que deve analisar COMPLETAMENTE todos os dados fornecidos pelo usuário para gerar um plano de ação educacional personalizado.

=== ANÁLISE OBRIGATÓRIA ===

MENSAGEM INICIAL COMPLETA DO USUÁRIO:
"${message}"

DADOS COMPLETOS DO QUESTIONÁRIO DE CONTEXTUALIZAÇÃO:
▶️ Matérias e Temas Específicos: "${contextData.subjects}"
▶️ Público-Alvo Detalhado: "${contextData.audience}"
▶️ Restrições e Preferências: "${contextData.restrictions}"
▶️ Datas e Prazos Importantes: "${contextData.dates}"
▶️ Observações e Informações Adicionais: "${contextData.notes}"

=== LISTA COMPLETA DE ATIVIDADES DISPONÍVEIS ===
${activitiesAnalysisText}

=== INSTRUÇÕES DE ANÁLISE ===
1. ANALISE COMPLETAMENTE a mensagem inicial do usuário
2. CORRELACIONE com TODOS os dados do questionário
3. IDENTIFIQUE as necessidades educacionais específicas
4. SELECIONE de 3 a 6 atividades mais adequadas da lista
5. PERSONALIZE títulos e descrições baseando-se em TODAS as informações coletadas

=== CRITÉRIOS DE SELEÇÃO ===
- Adequação ao público-alvo especificado
- Compatibilidade com as matérias/temas mencionados
- Respeito às restrições indicadas
- Consideração dos prazos e datas importantes
- Alinhamento com as observações adicionais
- Variedade de tipos de atividades (estudo, avaliação, prática, etc.)

=== FORMATO DE RESPOSTA OBRIGATÓRIO ===
Retorne APENAS o JSON no formato:
[
  {
    "id": "id-exato-da-atividade-da-lista",
    "personalizedTitle": "Título personalizado baseado em TODA a análise",
    "personalizedDescription": "Descrição detalhada considerando TODOS os dados coletados"
  }
]

EXEMPLO BASEADO EM ANÁLISE COMPLETA:
[
  {
    "id": "prova-interativa",
    "personalizedTitle": "Avaliação de Matemática - Álgebra Linear - 3º EM - Prova 15/03",
    "personalizedDescription": "Prova interativa sobre sistemas lineares e matrizes, adaptada para turma avançada do 3º ano, com correção automática para entregar resultados até 20/03."
  }
]

RESPONDA APENAS COM O JSON - SEM TEXTO ADICIONAL.`;

      console.log('📤 Enviando prompt para Gemini API...');

      // Fazer requisição para API Gemini
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API Gemini: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('Nenhum conteúdo gerado pela IA Gemini');
      }

      console.log('📥 Resposta recebida da IA Gemini:', generatedText);

      // Extrair JSON da resposta
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Formato JSON inválido na resposta da IA');
      }

      const generatedActivities = JSON.parse(jsonMatch[0]);
      console.log('✅ Atividades geradas pela IA:', generatedActivities);

      // Validar e processar atividades geradas
      const validActivities = generatedActivities
        .filter((activity: any) => {
          // Verificar se o ID existe na lista de atividades
          const exists = schoolPowerActivities.some(available => available.id === activity.id);
          if (!exists) {
            console.warn(`⚠️ Atividade ${activity.id} não encontrada na lista disponível`);
          }
          return exists && activity.personalizedTitle && activity.personalizedDescription;
        })
        .slice(0, 6); // Limitar a 6 atividades máximo

      if (validActivities.length === 0) {
        console.error('❌ Nenhuma atividade válida foi gerada pela IA');
        throw new Error('IA não conseguiu gerar atividades válidas com base nos dados fornecidos');
      }

      // Converter para ActionPlanItem[] com dados originais + personalizados
      const actionPlanItems: ActionPlanItem[] = validActivities.map((item: any) => {
        const originalActivity = schoolPowerActivities.find(orig => orig.id === item.id);
        
        return {
          id: item.id,
          title: originalActivity?.title || 'Atividade',
          description: originalActivity?.description || 'Descrição da atividade',
          personalizedTitle: item.personalizedTitle,
          personalizedDescription: item.personalizedDescription,
          approved: false
        };
      });

      console.log('✅ Plano de ação gerado com análise completa:', actionPlanItems);
      console.log('📊 Atividades personalizadas baseadas em:', {
        mensagemInicial: message,
        dadosContextualizacao: contextData,
        atividadesGeradas: actionPlanItems.length
      });
      
      return actionPlanItems;
      
    } catch (error) {
      console.error('❌ Erro ao gerar plano de ação com IA Gemini:', error);
      
      // Fallback com análise dos dados coletados
      const fallbackActivities: ActionPlanItem[] = [];
      
      // Gerar fallback baseado nos dados reais coletados
      if (contextData.subjects) {
        fallbackActivities.push({
          id: "resumo-inteligente",
          title: "Resumo Inteligente",
          description: "Criar resumos otimizados dos conteúdos principais",
          personalizedTitle: `Resumo de ${contextData.subjects} para ${contextData.audience}`,
          personalizedDescription: `Resumo personalizado sobre ${contextData.subjects}, adaptado para ${contextData.audience}${contextData.dates ? ` - Prazo: ${contextData.dates}` : ''}`,
          approved: false
        });
      }

      if (contextData.audience && contextData.subjects) {
        fallbackActivities.push({
          id: "lista-exercicios",
          title: "Lista de Exercícios", 
          description: "Gerar exercícios práticos sobre o tema",
          personalizedTitle: `Exercícios de ${contextData.subjects} - ${contextData.audience}`,
          personalizedDescription: `Lista de exercícios práticos sobre ${contextData.subjects} para ${contextData.audience}${contextData.restrictions ? ` - Observações: ${contextData.restrictions}` : ''}`,
          approved: false
        });

        fallbackActivities.push({
          id: "prova-interativa",
          title: "Prova Interativa",
          description: "Criar avaliação com correção automática", 
          personalizedTitle: `Avaliação de ${contextData.subjects} - ${contextData.audience}`,
          personalizedDescription: `Prova interativa sobre ${contextData.subjects} adaptada para ${contextData.audience}${contextData.notes ? ` - ${contextData.notes}` : ''}`,
          approved: false
        });
      }

      // Adicionar atividade baseada na mensagem inicial se não houver suficientes
      if (fallbackActivities.length < 3 && message) {
        fallbackActivities.push({
          id: "plano-estudo",
          title: "Plano de Estudos",
          description: "Cronograma personalizado de estudos",
          personalizedTitle: "Plano de Estudos Personalizado",
          personalizedDescription: `Cronograma baseado na solicitação: "${message.substring(0, 100)}..."`,
          approved: false
        });
      }

      console.log('🔄 Fallback com análise dos dados coletados:', fallbackActivities);
      console.log('📝 Dados utilizados no fallback:', {
        mensagem: message,
        materias: contextData.subjects,
        publico: contextData.audience,
        restricoes: contextData.restrictions,
        datas: contextData.dates,
        observacoes: contextData.notes
      });

      return fallbackActivities;
    }
  }, []);

  // Submete dados de contextualização e gera action plan
  const submitContextualization = useCallback(async (data: ContextualizationData) => {
    console.log('📝 Contextualização submetida:', data);
    setIsLoading(true);
    setFlowState('actionplan');
    
    try {
      // Gerar action plan com IA Gemini usando dados reais
      const actionPlan = await generateActionPlan(flowData.initialMessage || '', data);
      
      const newData: SchoolPowerFlowData = {
        ...flowData,
        contextualizationData: data,
        actionPlan,
        timestamp: Date.now()
      };
      
      setFlowData(newData);
      saveData(newData);
      console.log('✅ Action plan gerado e salvo:', actionPlan);
      
    } catch (error) {
      console.error('❌ Erro ao processar contextualização:', error);
      // Manter estado de erro visível para o usuário
      setFlowState('contextualizing');
    } finally {
      setIsLoading(false);
    }
  }, [flowData, saveData, generateActionPlan]);

  // Aprova action plan e inicia geração de atividades
  const approveActionPlan = useCallback((approvedItems: ActionPlanItem[]) => {
    console.log('✅ Action plan aprovado:', approvedItems);
    setIsLoading(true);
    setFlowState('generatingActivities');
    
    // Simula geração das atividades aprovadas
    setTimeout(() => {
      console.log('🤖 Gerando atividades aprovadas:', approvedItems);
      setIsLoading(false);
      
      // Aqui será integrado com a geração real das atividades
      // Por enquanto, volta para o estado idle após gerar
      setTimeout(() => {
        setFlowState('idle');
      }, 3000);
    }, 2000);
  }, []);

  // Reseta todo o fluxo
  const resetFlow = useCallback(() => {
    console.log('🔄 Resetando School Power Flow');
    
    const emptyData: SchoolPowerFlowData = {
      initialMessage: null,
      contextualizationData: null,
      actionPlan: null,
      timestamp: Date.now()
    };
    
    setFlowData(emptyData);
    saveData(emptyData);
    setFlowState('idle');
    setIsLoading(false);
    
    // Limpa localStorage
    localStorage.removeItem(STORAGE_KEY);
  }, [saveData]);

  return {
    flowState,
    flowData,
    sendInitialMessage,
    submitContextualization,
    approveActionPlan,
    resetFlow,
    isLoading
  };
}

export default useSchoolPowerFlow;

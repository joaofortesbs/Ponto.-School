
import { getFieldMap } from './fieldMaps';
import { parseIAResponse } from './utils/parseIAResponse';
import { fillModalField } from './utils/fieldSetter';

export interface ModalBinderConfig {
  activityId: string;
  type: string;
  iaRawOutput: any;
  contextualizationData?: any;
}

export const modalBinderEngine = async (config: ModalBinderConfig): Promise<boolean> => {
  try {
    console.log('🔧 ModalBinderEngine: Iniciando sincronização automática para:', config.activityId);
    
    const { activityId, type, iaRawOutput, contextualizationData } = config;
    
    // 1. Obter mapeamento específico do tipo de atividade
    const fieldMap = getFieldMap(type);
    if (!fieldMap) {
      console.warn(`⚠️ Mapeamento não encontrado para tipo: ${type}`);
      return false;
    }
    
    // 2. Processar resposta da IA
    const parsedData = parseIAResponse(iaRawOutput, contextualizationData);
    if (!parsedData) {
      console.warn('⚠️ Falha ao processar resposta da IA');
      return false;
    }
    
    console.log('📊 Dados processados da IA:', parsedData);
    
    // 3. Preencher campos do modal automaticamente
    let fieldsFilledCount = 0;
    for (const [key, value] of Object.entries(parsedData)) {
      const selector = fieldMap[key];
      if (!selector || !value) continue;
      
      try {
        const success = await fillModalField(activityId, selector, value);
        if (success) fieldsFilledCount++;
      } catch (error) {
        console.error(`❌ Erro ao preencher campo ${key}:`, error);
      }
    }
    
    console.log(`✅ ${fieldsFilledCount} campos preenchidos automaticamente`);
    
    // 4. Aguardar um momento para garantir que todos os campos foram preenchidos
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 5. Acionar construção automática
    const buildSuccess = await triggerBuildButton(activityId);
    
    if (buildSuccess) {
      console.log('🎉 Atividade construída automaticamente com sucesso!');
      return true;
    } else {
      console.warn('⚠️ Falha na construção automática da atividade');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro no ModalBinderEngine:', error);
    return false;
  }
};

const triggerBuildButton = async (activityId: string): Promise<boolean> => {
  try {
    // Buscar o botão de construir atividade no modal específico
    const modalSelector = `[data-activity-id="${activityId}"]`;
    const modal = document.querySelector(modalSelector);
    
    if (!modal) {
      console.warn(`Modal não encontrado para atividade: ${activityId}`);
      return false;
    }
    
    // Buscar botão "Construir Atividade" ou similar
    const buildButton = modal.querySelector('button[data-action="build"], button:contains("Construir"), button:contains("Gerar")') as HTMLButtonElement;
    
    if (buildButton && !buildButton.disabled) {
      buildButton.click();
      console.log('🔥 Botão de construção acionado automaticamente');
      return true;
    } else {
      console.warn('Botão de construção não encontrado ou está desabilitado');
      return false;
    }
  } catch (error) {
    console.error('Erro ao acionar botão de construção:', error);
    return false;
  }
};

export { triggerBuildButton };
